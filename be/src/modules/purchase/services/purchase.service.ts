import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { PurchaseOrder } from '../entities/PurchaseOrder';
import { Payment } from '../entities/Payment';
import { Policy } from '../entities/Policy';
import { Quotation } from '../../quotation/entities/Quotation';
import { EkycService, EkycVerificationInput } from './ekyc.service';
import { UnderwritingService, UnderwritingInput } from './underwriting.service';
import { PaymentGatewayFactory, PaymentRequest } from './payment-gateway.service';
import { PolicyDocumentService } from './policy-document.service';
import { NotFoundError, ValidationError, AppError } from '../../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export interface CreateOrderInput {
  quotation_id: string;
  applicant_info: {
    full_name: string;
    id_number: string;
    date_of_birth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    occupation?: string;
  };
  beneficiary_info?: Array<{
    full_name: string;
    relationship: string;
    id_number: string;
    percentage: number;
  }>;
}

export interface UpdateWizardStepInput {
  step: number;
  data: Record<string, any>;
}

export interface InitiatePaymentInput {
  payment_method: string;
  return_url: string;
  notify_url?: string;
}

export class PurchaseService {
  private orderRepo: Repository<PurchaseOrder>;
  private paymentRepo: Repository<Payment>;
  private policyRepo: Repository<Policy>;
  private quotationRepo: Repository<Quotation>;

  constructor() {
    this.orderRepo = AppDataSource.getRepository(PurchaseOrder);
    this.paymentRepo = AppDataSource.getRepository(Payment);
    this.policyRepo = AppDataSource.getRepository(Policy);
    this.quotationRepo = AppDataSource.getRepository(Quotation);
  }

  /**
   * Step 1: Create purchase order from accepted quotation
   */
  async createOrder(customerId: string, input: CreateOrderInput) {
    // Validate quotation
    const quotation = await this.quotationRepo.findOne({
      where: { id: input.quotation_id, customerId },
    });

    if (!quotation) {
      throw new NotFoundError('Báo giá không tìm thấy');
    }

    if (quotation.status !== 'accepted' && quotation.status !== 'quoted') {
      throw new ValidationError('Báo giá không ở trạng thái có thể mua');
    }

    if (new Date() > quotation.validUntil) {
      throw new ValidationError('Báo giá đã hết hạn');
    }

    // Create order
    const orderNumber = this.generateOrderNumber(quotation.insuranceType);
    const order = this.orderRepo.create({
      orderNumber,
      customerId,
      quotationId: quotation.id,
      productId: quotation.productId,
      insurerId: quotation.insurerId,
      insuranceType: quotation.insuranceType,
      currentStep: 1,
      totalSteps: 5,
      applicantInfo: input.applicant_info,
      beneficiaryInfo: input.beneficiary_info || [],
      premiumAmount: quotation.basePremium,
      discountAmount: quotation.discount || 0,
      taxAmount: quotation.tax || 0,
      totalAmount: quotation.totalPremium,
      status: 'draft',
      statusHistory: [
        { status: 'draft', timestamp: new Date().toISOString(), note: 'Đơn hàng được tạo' },
      ],
    });

    const saved = await this.orderRepo.save(order);

    // Update quotation status
    quotation.status = 'converted';
    await this.quotationRepo.save(quotation);

    return this.formatOrder(saved);
  }

  /**
   * Step 2: Update wizard step data
   */
  async updateWizardStep(orderId: string, customerId: string, input: UpdateWizardStepInput) {
    const order = await this.findOrder(orderId, customerId);

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new ValidationError('Đơn hàng không thể chỉnh sửa');
    }

    // Update wizard data for specific step
    order.wizardData = {
      ...order.wizardData,
      [`step_${input.step}`]: input.data,
    };
    order.currentStep = input.step;

    // Update applicant info if step 1
    if (input.step === 1 && input.data.applicant_info) {
      order.applicantInfo = input.data.applicant_info;
    }

    // Update beneficiary info if step 2
    if (input.step === 2 && input.data.beneficiary_info) {
      order.beneficiaryInfo = input.data.beneficiary_info;
    }

    await this.orderRepo.save(order);
    return this.formatOrder(order);
  }

  /**
   * Step 3: Perform eKYC verification
   */
  async performEkyc(orderId: string, customerId: string, input: EkycVerificationInput) {
    const order = await this.findOrder(orderId, customerId);

    if (order.ekycStatus === 'verified') {
      throw new ValidationError('eKYC đã được xác minh');
    }

    // Perform eKYC
    const result = await EkycService.verifyIdentity(input);

    order.ekycStatus = result.status === 'verified' ? 'verified' : 'failed';
    order.ekycData = {
      verification_id: result.verification_id,
      confidence_score: result.confidence_score,
      extracted_data: result.extracted_data,
      face_match: result.face_match,
    };
    order.ekycVerifiedAt = result.status === 'verified' ? new Date() : undefined;

    // Auto-fill applicant info from eKYC data
    if (result.success && result.extracted_data) {
      order.applicantInfo = {
        ...order.applicantInfo,
        full_name: result.extracted_data.full_name || order.applicantInfo.full_name,
        id_number: result.extracted_data.id_number || order.applicantInfo.id_number,
        date_of_birth: result.extracted_data.date_of_birth || order.applicantInfo.date_of_birth,
        gender: result.extracted_data.gender || order.applicantInfo.gender,
        address: result.extracted_data.place_of_residence || order.applicantInfo.address,
      };
    }

    // Update status
    if (result.status === 'verified') {
      order.status = 'pending_underwriting';
      order.statusHistory.push({
        status: 'pending_underwriting',
        timestamp: new Date().toISOString(),
        note: 'eKYC xác minh thành công',
      });
    }

    await this.orderRepo.save(order);

    return {
      order_id: order.id,
      ekyc_status: order.ekycStatus,
      verification_id: result.verification_id,
      confidence_score: result.confidence_score,
      extracted_data: result.extracted_data,
      face_match: result.face_match,
    };
  }

  /**
   * Step 4: Run auto-underwriting
   */
  async runUnderwriting(orderId: string, customerId: string) {
    const order = await this.findOrder(orderId, customerId);

    if (order.ekycStatus !== 'verified') {
      throw new ValidationError('Cần hoàn thành eKYC trước khi thẩm định');
    }

    // Build underwriting input from order data
    const age = this.calculateAge(order.applicantInfo.date_of_birth);
    const uwInput: UnderwritingInput = {
      insurance_type: order.insuranceType,
      applicant: {
        age,
        gender: order.applicantInfo.gender,
        occupation: order.applicantInfo.occupation,
        id_number: order.applicantInfo.id_number,
        address: order.applicantInfo.address,
      },
      coverage: {
        type: order.wizardData?.coverage_type || 'comprehensive',
        sum_insured: Number(order.totalAmount) * 100, // Estimate coverage
        duration_months: order.wizardData?.duration_months || 12,
      },
      vehicle: order.wizardData?.vehicle_info,
      health_declaration: order.wizardData?.health_declaration,
      claims_history: order.wizardData?.claims_history,
    };

    const result = UnderwritingService.evaluate(uwInput);

    // Update order with underwriting result
    order.underwritingStatus = result.decision;
    order.underwritingResult = result;
    order.underwritingAt = new Date();

    // Apply premium adjustment if any
    if (result.premium_adjustment) {
      const adjustment = Number(order.totalAmount) * result.premium_adjustment / 100;
      order.totalAmount = Number(order.totalAmount) + adjustment;
    }

    // Update status based on decision
    if (result.decision === 'auto_approved') {
      order.status = 'pending_payment';
      order.statusHistory.push({
        status: 'pending_payment',
        timestamp: new Date().toISOString(),
        note: 'Thẩm định tự động - Chấp thuận',
      });
    } else if (result.decision === 'declined') {
      order.status = 'rejected';
      order.statusHistory.push({
        status: 'rejected',
        timestamp: new Date().toISOString(),
        note: `Thẩm định từ chối: ${result.reasons.join(', ')}`,
      });
    } else {
      order.status = 'pending_underwriting';
      order.statusHistory.push({
        status: 'pending_underwriting',
        timestamp: new Date().toISOString(),
        note: 'Chuyển xem xét thủ công',
      });
    }

    await this.orderRepo.save(order);

    return {
      order_id: order.id,
      underwriting_decision: result.decision,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      reasons: result.reasons,
      conditions: result.conditions,
      premium_adjustment: result.premium_adjustment,
      total_amount: order.totalAmount,
    };
  }

  /**
   * Step 5: Initiate payment
   */
  async initiatePayment(orderId: string, customerId: string, input: InitiatePaymentInput) {
    const order = await this.findOrder(orderId, customerId);

    if (order.status !== 'pending_payment') {
      throw new ValidationError('Đơn hàng chưa sẵn sàng thanh toán');
    }

    // Check if there's an existing pending payment
    const existingPayment = await this.paymentRepo.findOne({
      where: { orderId: order.id, status: 'pending' },
    });

    if (existingPayment && existingPayment.expiresAt && new Date() < existingPayment.expiresAt) {
      return {
        payment_id: existingPayment.id,
        payment_url: existingPayment.gatewayUrl,
        expires_at: existingPayment.expiresAt,
        status: 'pending',
      };
    }

    // Create payment request
    const paymentNumber = this.generatePaymentNumber();
    const gateway = input.payment_method === 'momo' ? 'momo' : 'vnpay';

    const paymentRequest: PaymentRequest = {
      order_id: order.orderNumber,
      amount: Number(order.totalAmount),
      description: `Thanh toán BH ${order.insuranceType} - ${order.orderNumber}`,
      return_url: input.return_url,
      notify_url: input.notify_url || `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/purchase/payment/callback/${gateway}`,
      customer_info: {
        name: order.applicantInfo.full_name,
        email: order.applicantInfo.email,
        phone: order.applicantInfo.phone,
      },
    };

    // Call payment gateway
    const gatewayResponse = await PaymentGatewayFactory.createPayment(gateway, paymentRequest);

    // Save payment record
    const payment = this.paymentRepo.create({
      paymentNumber,
      orderId: order.id,
      customerId,
      amount: Number(order.totalAmount),
      currency: 'VND',
      paymentMethod: input.payment_method,
      paymentGateway: gateway,
      gatewayTransactionId: gatewayResponse.transaction_id,
      gatewayResponse: gatewayResponse.raw_response || {},
      gatewayUrl: gatewayResponse.payment_url,
      status: 'pending',
      expiresAt: new Date(gatewayResponse.expires_at),
    });

    const savedPayment = await this.paymentRepo.save(payment);

    return {
      payment_id: savedPayment.id,
      payment_number: savedPayment.paymentNumber,
      payment_url: gatewayResponse.payment_url,
      gateway: gateway,
      amount: Number(order.totalAmount),
      expires_at: gatewayResponse.expires_at,
      status: 'pending',
    };
  }

  /**
   * Handle payment callback/IPN from gateway
   */
  async handlePaymentCallback(gateway: string, params: Record<string, any>) {
    const verifyResult = PaymentGatewayFactory.verifyPayment(gateway, params);

    // Find the payment by transaction ID
    const payment = await this.paymentRepo.findOne({
      where: { gatewayTransactionId: verifyResult.transaction_id },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (verifyResult.success && verifyResult.status === 'success') {
      payment.status = 'paid';
      payment.paidAt = new Date();
      payment.gatewayResponse = { ...payment.gatewayResponse, callback: params };
      await this.paymentRepo.save(payment);

      // Update order status
      const order = await this.orderRepo.findOne({ where: { id: payment.orderId } });
      if (order) {
        order.status = 'paid';
        order.statusHistory.push({
          status: 'paid',
          timestamp: new Date().toISOString(),
          note: `Thanh toán thành công qua ${gateway}`,
        });
        await this.orderRepo.save(order);

        // Auto-issue policy
        await this.issuePolicy(order);
      }

      return { success: true, order_id: payment.orderId, status: 'paid' };
    } else {
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.gatewayResponse = { ...payment.gatewayResponse, callback: params };
      await this.paymentRepo.save(payment);

      return { success: false, order_id: payment.orderId, status: 'failed' };
    }
  }

  /**
   * Issue policy after successful payment
   */
  private async issuePolicy(order: PurchaseOrder) {
    const policyNumber = this.generatePolicyNumber(order.insuranceType);
    const effectiveDate = new Date();
    const durationMonths = order.wizardData?.duration_months || 12;
    const expiryDate = new Date(effectiveDate);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    // Generate policy document
    const docInput = {
      policy_number: policyNumber,
      insurance_type: order.insuranceType,
      plan_name: order.wizardData?.plan_name || 'Gói tiêu chuẩn',
      insurer_name: order.wizardData?.insurer_name || 'Công ty Bảo hiểm',
      insured_info: {
        full_name: order.applicantInfo.full_name,
        id_number: order.applicantInfo.id_number,
        date_of_birth: order.applicantInfo.date_of_birth,
        address: order.applicantInfo.address,
        phone: order.applicantInfo.phone,
        email: order.applicantInfo.email,
      },
      beneficiary_info: order.beneficiaryInfo,
      coverage_details: {
        type: order.wizardData?.coverage_type || 'comprehensive',
        sum_insured: Number(order.totalAmount) * 100,
        coverage_items: order.wizardData?.coverage_items || [
          { name: 'Bảo hiểm chính', limit: Number(order.totalAmount) * 100, description: 'Quyền lợi chính' },
        ],
      },
      premium: {
        base: Number(order.premiumAmount),
        discount: Number(order.discountAmount),
        tax: Number(order.taxAmount),
        total: Number(order.totalAmount),
        payment_frequency: 'one_time',
      },
      dates: {
        effective_date: effectiveDate.toISOString().split('T')[0],
        expiry_date: expiryDate.toISOString().split('T')[0],
        issued_date: new Date().toISOString().split('T')[0],
      },
    };

    const policyDoc = await PolicyDocumentService.generatePolicyDocument(docInput);
    const certificate = await PolicyDocumentService.generateCertificate(docInput);

    // Create policy record
    const policy = this.policyRepo.create({
      policyNumber,
      orderId: order.id,
      customerId: order.customerId,
      productId: order.productId,
      insurerId: order.insurerId,
      insuranceType: order.insuranceType,
      planName: order.wizardData?.plan_name || 'Gói tiêu chuẩn',
      coverageDetails: docInput.coverage_details,
      insuredInfo: docInput.insured_info,
      beneficiaryInfo: order.beneficiaryInfo,
      premiumAmount: Number(order.totalAmount),
      paymentFrequency: 'one_time',
      effectiveDate,
      expiryDate,
      issuedDate: new Date(),
      policyDocumentUrl: policyDoc.document_url,
      certificateUrl: certificate.document_url,
      status: 'active',
      signatureStatus: 'pending',
      metadata: {
        policy_document: policyDoc,
        certificate: certificate,
      },
    });

    await this.policyRepo.save(policy);

    // Update order status to completed
    order.status = 'completed';
    order.completedAt = new Date();
    order.statusHistory.push({
      status: 'completed',
      timestamp: new Date().toISOString(),
      note: `Hợp đồng ${policyNumber} đã được phát hành`,
    });
    await this.orderRepo.save(order);

    return policy;
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string, customerId: string) {
    const order = await this.findOrder(orderId, customerId);
    return this.formatOrder(order);
  }

  /**
   * Get customer's orders
   */
  async getCustomerOrders(customerId: string, page = 1, perPage = 10) {
    const [orders, total] = await this.orderRepo.findAndCount({
      where: { customerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      data: orders.map(o => this.formatOrder(o)),
      total,
      page,
      per_page: perPage,
    };
  }

  /**
   * Get customer's policies
   */
  async getCustomerPolicies(customerId: string, page = 1, perPage = 10, status?: string) {
    const where: any = { customerId };
    if (status) where.status = status;

    const [policies, total] = await this.policyRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      data: policies.map(p => this.formatPolicy(p)),
      total,
      page,
      per_page: perPage,
    };
  }

  /**
   * Get policy detail
   */
  async getPolicyById(policyId: string, customerId: string) {
    const policy = await this.policyRepo.findOne({
      where: { id: policyId, customerId },
    });

    if (!policy) {
      throw new NotFoundError('Hợp đồng không tìm thấy');
    }

    return this.formatPolicy(policy);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, customerId: string, reason?: string) {
    const order = await this.findOrder(orderId, customerId);

    if (['completed', 'cancelled'].includes(order.status)) {
      throw new ValidationError('Đơn hàng không thể hủy');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: reason || 'Hủy bởi khách hàng',
    });

    await this.orderRepo.save(order);
    return { success: true, message: 'Đơn hàng đã được hủy' };
  }

  // Helper methods
  private async findOrder(orderId: string, customerId: string): Promise<PurchaseOrder> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, customerId },
    });

    if (!order) {
      throw new NotFoundError('Đơn hàng không tìm thấy');
    }

    return order;
  }

  private calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  private generateOrderNumber(insuranceType: string): string {
    const prefix = insuranceType.toUpperCase().slice(0, 3);
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ORD-${prefix}-${timestamp}-${random}`;
  }

  private generatePaymentNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PAY-${timestamp}-${random}`;
  }

  private generatePolicyNumber(insuranceType: string): string {
    const prefix = insuranceType.toUpperCase().slice(0, 3);
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `POL-${prefix}-${year}-${seq}`;
  }

  private formatOrder(order: PurchaseOrder) {
    return {
      id: order.id,
      order_number: order.orderNumber,
      insurance_type: order.insuranceType,
      current_step: order.currentStep,
      total_steps: order.totalSteps,
      applicant_info: order.applicantInfo,
      beneficiary_info: order.beneficiaryInfo,
      ekyc_status: order.ekycStatus,
      underwriting_status: order.underwritingStatus,
      premium: {
        base: order.premiumAmount,
        discount: order.discountAmount,
        tax: order.taxAmount,
        total: order.totalAmount,
      },
      status: order.status,
      status_history: order.statusHistory,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    };
  }

  private formatPolicy(policy: Policy) {
    return {
      id: policy.id,
      policy_number: policy.policyNumber,
      insurance_type: policy.insuranceType,
      plan_name: policy.planName,
      insured_info: policy.insuredInfo,
      beneficiary_info: policy.beneficiaryInfo,
      coverage_details: policy.coverageDetails,
      premium_amount: policy.premiumAmount,
      payment_frequency: policy.paymentFrequency,
      effective_date: policy.effectiveDate,
      expiry_date: policy.expiryDate,
      issued_date: policy.issuedDate,
      policy_document_url: policy.policyDocumentUrl,
      certificate_url: policy.certificateUrl,
      status: policy.status,
      signature_status: policy.signatureStatus,
      created_at: policy.createdAt,
    };
  }
}
