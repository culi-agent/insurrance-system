import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export interface MobilePurchaseInput {
  quotation_id: string;
  payment_method: 'vnpay' | 'momo' | 'zalopay' | 'bank_transfer' | 'apple_pay' | 'google_pay';
  personal_info: {
    full_name: string;
    phone: string;
    email: string;
    id_number: string;
    date_of_birth: string;
    address: string;
  };
  beneficiaries?: Array<{
    full_name: string;
    relationship: string;
    percentage: number;
    phone?: string;
  }>;
  coverage_options?: Record<string, any>;
  device_info?: {
    platform: 'ios' | 'android';
    device_id: string;
    app_version: string;
    os_version: string;
  };
}

export interface MobilePaymentResult {
  order_id: string;
  payment_id: string;
  payment_url?: string; // For redirect-based payments
  payment_token?: string; // For SDK-based payments (Apple Pay, Google Pay)
  deep_link?: string; // For app-based payments (Momo, ZaloPay)
  status: 'pending' | 'processing' | 'completed' | 'failed';
  expires_at: string;
}

export interface MobileOrderSummary {
  order_id: string;
  product_name: string;
  insurance_type: string;
  insurer_name: string;
  premium_amount: number;
  coverage_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  policy_number?: string;
}

export class MobilePurchaseService {
  /**
   * Quick purchase from mobile - streamlined flow
   */
  async quickPurchase(customerId: string, input: MobilePurchaseInput): Promise<MobilePaymentResult> {
    // Validate quotation exists and belongs to customer
    const quotation = await AppDataSource.query(
      `SELECT q.*, p.name as product_name, p.insurance_type, i.name as insurer_name
       FROM quotation q
       JOIN product p ON q.product_id = p.id
       LEFT JOIN insurer i ON q.insurer_id = i.id
       WHERE q.id = $1 AND q.customer_id = $2 AND q.status IN ('quoted', 'accepted')`,
      [input.quotation_id, customerId]
    );

    if (quotation.length === 0) {
      throw new NotFoundError('Báo giá không tồn tại hoặc đã hết hạn');
    }

    const quote = quotation[0];

    // Check quote expiry
    if (quote.expires_at && new Date(quote.expires_at) < new Date()) {
      throw new ValidationError('Báo giá đã hết hạn. Vui lòng tạo báo giá mới.');
    }

    // Create purchase order
    const orderId = uuidv4();
    const paymentId = uuidv4();

    await AppDataSource.query(
      `INSERT INTO purchase_order (id, customer_id, quotation_id, product_id, insurer_id, 
       status, personal_info, beneficiaries, coverage_options, premium_amount, 
       payment_method, device_info, source, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'pending_payment', $6, $7, $8, $9, $10, $11, 'mobile', NOW(), NOW())`,
      [
        orderId, customerId, input.quotation_id, quote.product_id, quote.insurer_id,
        JSON.stringify(input.personal_info),
        JSON.stringify(input.beneficiaries || []),
        JSON.stringify(input.coverage_options || {}),
        quote.premium_amount || quote.total_premium,
        input.payment_method,
        JSON.stringify(input.device_info || {}),
      ]
    );

    // Auto-run underwriting for simple products
    const underwritingResult = await this.autoUnderwrite(orderId, quote.insurance_type, input.personal_info);

    if (underwritingResult === 'declined') {
      await AppDataSource.query(
        `UPDATE purchase_order SET status = 'declined', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );
      throw new ValidationError('Đơn bảo hiểm không được chấp nhận. Vui lòng liên hệ hỗ trợ.');
    }

    // Initiate payment
    const premiumAmount = parseFloat(quote.premium_amount || quote.total_premium);
    const paymentResult = await this.initiateMobilePayment(
      paymentId, orderId, customerId, premiumAmount, input.payment_method, input.device_info
    );

    logger.info(`[Mobile] Purchase initiated: order=${orderId}, payment=${paymentId}, method=${input.payment_method}`);

    return paymentResult;
  }

  /**
   * Check payment status (polling from mobile app)
   */
  async checkPaymentStatus(customerId: string, orderId: string): Promise<{ status: string; policy_id?: string; policy_number?: string }> {
    const order = await AppDataSource.query(
      `SELECT po.status as order_status, pay.status as payment_status, 
              pol.id as policy_id, pol.policy_number
       FROM purchase_order po
       LEFT JOIN payment pay ON pay.order_id = po.id
       LEFT JOIN policy pol ON pol.order_id = po.id
       WHERE po.id = $1 AND po.customer_id = $2`,
      [orderId, customerId]
    );

    if (order.length === 0) {
      throw new NotFoundError('Đơn hàng không tìm thấy');
    }

    return {
      status: order[0].payment_status || order[0].order_status,
      policy_id: order[0].policy_id,
      policy_number: order[0].policy_number,
    };
  }

  /**
   * Get order history for mobile
   */
  async getOrderHistory(customerId: string, page: number = 1, limit: number = 20): Promise<{ orders: MobileOrderSummary[]; total: number }> {
    const offset = (page - 1) * limit;

    const [orders, countResult] = await Promise.all([
      AppDataSource.query(
        `SELECT po.id as order_id, p.name as product_name, p.insurance_type,
                COALESCE(i.name, 'N/A') as insurer_name, po.premium_amount,
                COALESCE((po.coverage_options->>'sum_insured')::numeric, po.premium_amount * 100) as coverage_amount,
                po.payment_method, COALESCE(pay.status, 'pending') as payment_status,
                po.status as order_status, po.created_at,
                pol.policy_number
         FROM purchase_order po
         JOIN product p ON po.product_id = p.id
         LEFT JOIN insurer i ON po.insurer_id = i.id
         LEFT JOIN payment pay ON pay.order_id = po.id
         LEFT JOIN policy pol ON pol.order_id = po.id
         WHERE po.customer_id = $1
         ORDER BY po.created_at DESC
         LIMIT $2 OFFSET $3`,
        [customerId, limit, offset]
      ),
      AppDataSource.query(
        `SELECT COUNT(*) as total FROM purchase_order WHERE customer_id = $1`,
        [customerId]
      ),
    ]);

    return {
      orders: orders.map((o: any) => ({
        order_id: o.order_id,
        product_name: o.product_name,
        insurance_type: o.insurance_type,
        insurer_name: o.insurer_name,
        premium_amount: parseFloat(o.premium_amount),
        coverage_amount: parseFloat(o.coverage_amount),
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        order_status: o.order_status,
        created_at: o.created_at,
        policy_number: o.policy_number,
      })),
      total: parseInt(countResult[0]?.total) || 0,
    };
  }

  /**
   * Retry failed payment
   */
  async retryPayment(customerId: string, orderId: string, paymentMethod: string): Promise<MobilePaymentResult> {
    const order = await AppDataSource.query(
      `SELECT po.*, pay.status as last_payment_status
       FROM purchase_order po
       LEFT JOIN payment pay ON pay.order_id = po.id
       WHERE po.id = $1 AND po.customer_id = $2 AND po.status IN ('pending_payment', 'payment_failed')`,
      [orderId, customerId]
    );

    if (order.length === 0) {
      throw new NotFoundError('Đơn hàng không tìm thấy hoặc không thể thanh toán lại');
    }

    const paymentId = uuidv4();
    const premiumAmount = parseFloat(order[0].premium_amount);

    return this.initiateMobilePayment(
      paymentId, orderId, customerId, premiumAmount,
      paymentMethod as MobilePurchaseInput['payment_method'],
      null
    );
  }

  // ============ Private Methods ============

  private async autoUnderwrite(orderId: string, insuranceType: string, personalInfo: any): Promise<'accepted' | 'referred' | 'declined'> {
    // Simple auto-underwriting rules for mobile
    const age = this.calculateAge(personalInfo.date_of_birth);

    if (insuranceType === 'motor' || insuranceType === 'travel') {
      return 'accepted'; // Auto-accept simple products
    }

    if (insuranceType === 'health' && age > 65) {
      return 'referred'; // Refer to manual underwriting
    }

    if (insuranceType === 'life' && age > 60) {
      return 'referred';
    }

    return 'accepted';
  }

  private async initiateMobilePayment(
    paymentId: string,
    orderId: string,
    customerId: string,
    amount: number,
    method: MobilePurchaseInput['payment_method'],
    deviceInfo: any,
  ): Promise<MobilePaymentResult> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save payment record
    await AppDataSource.query(
      `INSERT INTO payment (id, order_id, customer_id, amount, payment_method, status, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW(), NOW())
       ON CONFLICT (order_id) DO UPDATE SET 
         id = $1, amount = $4, payment_method = $5, status = 'pending', expires_at = $6, updated_at = NOW()`,
      [paymentId, orderId, customerId, amount, method, expiresAt.toISOString()]
    );

    // Generate payment URLs/tokens based on method
    const result: MobilePaymentResult = {
      order_id: orderId,
      payment_id: paymentId,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    };

    switch (method) {
      case 'vnpay':
        result.payment_url = this.generateVNPayUrl(paymentId, amount, orderId);
        break;
      case 'momo':
        result.deep_link = this.generateMomoDeepLink(paymentId, amount, orderId);
        break;
      case 'zalopay':
        result.deep_link = this.generateZaloPayDeepLink(paymentId, amount, orderId);
        break;
      case 'apple_pay':
        result.payment_token = this.generateApplePayToken(paymentId, amount);
        break;
      case 'google_pay':
        result.payment_token = this.generateGooglePayToken(paymentId, amount);
        break;
      case 'bank_transfer':
        result.payment_url = this.generateBankTransferInfo(paymentId, amount);
        break;
    }

    return result;
  }

  private generateVNPayUrl(paymentId: string, amount: number, orderId: string): string {
    const baseUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    return `${baseUrl}?vnp_TxnRef=${paymentId}&vnp_Amount=${amount * 100}&vnp_OrderInfo=${orderId}`;
  }

  private generateMomoDeepLink(paymentId: string, amount: number, orderId: string): string {
    return `momo://app?action=payWithApp&amount=${amount}&orderId=${orderId}&requestId=${paymentId}`;
  }

  private generateZaloPayDeepLink(paymentId: string, amount: number, orderId: string): string {
    return `zalopay://app?action=pay&amount=${amount}&orderId=${orderId}&transId=${paymentId}`;
  }

  private generateApplePayToken(paymentId: string, amount: number): string {
    // In production, this would be a proper Apple Pay merchant session token
    return `apay_${paymentId}_${amount}`;
  }

  private generateGooglePayToken(paymentId: string, amount: number): string {
    // In production, this would be a proper Google Pay payment data token
    return `gpay_${paymentId}_${amount}`;
  }

  private generateBankTransferInfo(paymentId: string, amount: number): string {
    return `/api/v1/mobile/purchase/bank-transfer/${paymentId}`;
  }

  private calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }
}
