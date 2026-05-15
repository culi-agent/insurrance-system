/**
 * Payment Gateway Service
 * Integrates with VNPay and Momo payment gateways
 */
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentRequest {
  order_id: string;
  amount: number;
  currency?: string;
  description: string;
  return_url: string;
  notify_url: string;
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
  ip_address?: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  gateway: string;
  transaction_id: string;
  payment_url: string;
  expires_at: string;
  raw_response?: Record<string, any>;
}

export interface PaymentVerifyResult {
  success: boolean;
  transaction_id: string;
  order_id: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  paid_at?: string;
  raw_response?: Record<string, any>;
}

/**
 * VNPay Payment Gateway Integration
 */
export class VNPayGateway {
  private static readonly VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private static readonly TMN_CODE = process.env.VNPAY_TMN_CODE || 'DEMO_TMN';
  private static readonly HASH_SECRET = process.env.VNPAY_HASH_SECRET || 'DEMO_SECRET_KEY';
  private static readonly API_VERSION = '2.1.0';

  /**
   * Create VNPay payment URL
   */
  static async createPayment(request: PaymentRequest): Promise<PaymentGatewayResponse> {
    const transactionId = `VNP${Date.now()}`;
    const createDate = this.formatDate(new Date());
    const expireDate = this.formatDate(new Date(Date.now() + 15 * 60 * 1000)); // 15 min

    const vnpParams: Record<string, string> = {
      vnp_Version: this.API_VERSION,
      vnp_Command: 'pay',
      vnp_TmnCode: this.TMN_CODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: transactionId,
      vnp_OrderInfo: request.description,
      vnp_OrderType: 'insurance',
      vnp_Amount: String(request.amount * 100), // VNPay requires amount in smallest unit
      vnp_ReturnUrl: request.return_url,
      vnp_IpAddr: request.ip_address || '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sort params and create query string
    const sortedParams = Object.keys(vnpParams).sort().reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {} as Record<string, string>);

    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', this.HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentUrl = `${this.VNPAY_URL}?${signData}&vnp_SecureHash=${signed}`;

    return {
      success: true,
      gateway: 'vnpay',
      transaction_id: transactionId,
      payment_url: paymentUrl,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      raw_response: { params: sortedParams },
    };
  }

  /**
   * Verify VNPay IPN (Instant Payment Notification)
   */
  static verifyPayment(vnpParams: Record<string, string>): PaymentVerifyResult {
    const secureHash = vnpParams['vnp_SecureHash'];
    const paramsToVerify = { ...vnpParams };
    delete paramsToVerify['vnp_SecureHash'];
    delete paramsToVerify['vnp_SecureHashType'];

    // Sort and create signature
    const sortedParams = Object.keys(paramsToVerify).sort().reduce((acc, key) => {
      acc[key] = paramsToVerify[key];
      return acc;
    }, {} as Record<string, string>);

    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', this.HASH_SECRET);
    const expectedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isValid = secureHash === expectedHash;
    const responseCode = vnpParams['vnp_ResponseCode'];

    return {
      success: isValid && responseCode === '00',
      transaction_id: vnpParams['vnp_TxnRef'] || '',
      order_id: vnpParams['vnp_OrderInfo'] || '',
      amount: parseInt(vnpParams['vnp_Amount'] || '0') / 100,
      status: responseCode === '00' ? 'success' : 'failed',
      paid_at: isValid && responseCode === '00' ? new Date().toISOString() : undefined,
      raw_response: vnpParams,
    };
  }

  private static formatDate(date: Date): string {
    return date.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  }
}

/**
 * Momo Payment Gateway Integration
 */
export class MomoGateway {
  private static readonly MOMO_URL = process.env.MOMO_URL || 'https://test-payment.momo.vn/v2/gateway/api/create';
  private static readonly PARTNER_CODE = process.env.MOMO_PARTNER_CODE || 'DEMO_PARTNER';
  private static readonly ACCESS_KEY = process.env.MOMO_ACCESS_KEY || 'DEMO_ACCESS_KEY';
  private static readonly SECRET_KEY = process.env.MOMO_SECRET_KEY || 'DEMO_SECRET_KEY';

  /**
   * Create Momo payment
   */
  static async createPayment(request: PaymentRequest): Promise<PaymentGatewayResponse> {
    const requestId = uuidv4();
    const orderId = `MOMO${Date.now()}`;

    const rawSignature = `accessKey=${this.ACCESS_KEY}&amount=${request.amount}&extraData=&ipnUrl=${request.notify_url}&orderId=${orderId}&orderInfo=${request.description}&partnerCode=${this.PARTNER_CODE}&redirectUrl=${request.return_url}&requestId=${requestId}&requestType=payWithMethod`;

    const signature = crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    // In production, this would be an actual HTTP call to Momo API
    // For now, simulate the response
    const paymentUrl = `https://test-payment.momo.vn/gw_payment/transactionProcessor?orderId=${orderId}&requestId=${requestId}`;

    return {
      success: true,
      gateway: 'momo',
      transaction_id: orderId,
      payment_url: paymentUrl,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      raw_response: {
        partnerCode: this.PARTNER_CODE,
        requestId,
        orderId,
        amount: request.amount,
        signature,
      },
    };
  }

  /**
   * Verify Momo IPN callback
   */
  static verifyPayment(momoResponse: Record<string, any>): PaymentVerifyResult {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      extraData,
      signature,
    } = momoResponse;

    // Verify signature
    const rawSignature = `accessKey=${this.ACCESS_KEY}&amount=${amount}&extraData=${extraData || ''}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=&requestId=${requestId}&responseTime=${momoResponse.responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    const isValid = signature === expectedSignature;

    return {
      success: isValid && resultCode === 0,
      transaction_id: orderId,
      order_id: orderInfo || '',
      amount: parseInt(amount || '0'),
      status: resultCode === 0 ? 'success' : 'failed',
      paid_at: resultCode === 0 ? new Date().toISOString() : undefined,
      raw_response: momoResponse,
    };
  }
}

/**
 * Payment Gateway Factory
 */
export class PaymentGatewayFactory {
  static async createPayment(gateway: string, request: PaymentRequest): Promise<PaymentGatewayResponse> {
    switch (gateway) {
      case 'vnpay':
        return VNPayGateway.createPayment(request);
      case 'momo':
        return MomoGateway.createPayment(request);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  static verifyPayment(gateway: string, params: Record<string, any>): PaymentVerifyResult {
    switch (gateway) {
      case 'vnpay':
        return VNPayGateway.verifyPayment(params);
      case 'momo':
        return MomoGateway.verifyPayment(params);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }
}
