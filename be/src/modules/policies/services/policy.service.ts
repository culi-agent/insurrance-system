import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Policy } from '../entities/Policy';
import { Beneficiary } from '../entities/Beneficiary';
import { Quote } from '../../quotes/entities/Quote';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class PolicyService {
  private policyRepo: Repository<Policy>;
  private beneficiaryRepo: Repository<Beneficiary>;
  private quoteRepo: Repository<Quote>;

  constructor() {
    this.policyRepo = AppDataSource.getRepository(Policy);
    this.beneficiaryRepo = AppDataSource.getRepository(Beneficiary);
    this.quoteRepo = AppDataSource.getRepository(Quote);
  }

  /**
   * Create a policy from an accepted quote
   */
  async createFromQuote(data: {
    quote_id: string;
    customer_id: string;
    insured_info: Record<string, any>;
    beneficiaries?: Array<{
      full_name: string;
      relationship: string;
      date_of_birth?: string;
      gender?: string;
      id_number?: string;
      phone?: string;
      percentage: number;
    }>;
    payment_frequency?: string;
    start_date: string;
  }) {
    // Validate quote
    const quote = await this.quoteRepo.findOne({
      where: { id: data.quote_id },
      relations: ['insurer'],
    });

    if (!quote) {
      throw new NotFoundError('Quote không tìm thấy');
    }

    if (quote.status !== 'active') {
      throw new ValidationError('Quote đã hết hạn hoặc đã được sử dụng');
    }

    if (new Date() > quote.validUntil) {
      // Mark as expired
      quote.status = 'expired';
      await this.quoteRepo.save(quote);
      throw new ValidationError('Quote đã hết hạn');
    }

    // Validate beneficiaries sum to 100%
    if (data.beneficiaries && data.beneficiaries.length > 0) {
      const totalPercentage = data.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new ValidationError('Tổng phần trăm người thụ hưởng phải bằng 100%');
      }
    }

    // Calculate end date (1 year from start)
    const startDate = new Date(data.start_date);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Create policy
    const policy = this.policyRepo.create({
      policyNumber: this.generatePolicyNumber(quote.productType),
      customerId: data.customer_id,
      productId: quote.productId,
      insurerId: quote.insurerId,
      quoteId: quote.id,
      productType: quote.productType,
      status: 'pending', // pending payment
      insuredInfo: data.insured_info,
      coverageDetails: {
        sum_insured: quote.sumInsured,
        deductible: quote.deductible,
        benefits: quote.benefitsSummary,
        coverage_options: quote.coverageOptions,
      },
      premiumAnnual: quote.premiumAnnual,
      premiumMonthly: quote.premiumMonthly,
      paymentFrequency: data.payment_frequency || 'annual',
      sumInsured: quote.sumInsured,
      deductible: quote.deductible,
      startDate,
      endDate,
    });

    const savedPolicy = await this.policyRepo.save(policy);

    // Create beneficiaries
    if (data.beneficiaries && data.beneficiaries.length > 0) {
      const beneficiaryEntities = data.beneficiaries.map((b) =>
        this.beneficiaryRepo.create({
          policyId: savedPolicy.id,
          fullName: b.full_name,
          relationship: b.relationship,
          dateOfBirth: b.date_of_birth ? new Date(b.date_of_birth) : undefined,
          gender: b.gender,
          idNumber: b.id_number,
          phone: b.phone,
          percentage: b.percentage,
        }),
      );
      await this.beneficiaryRepo.save(beneficiaryEntities);
    }

    // Mark quote as converted
    quote.status = 'converted';
    quote.convertedPolicyId = savedPolicy.id;
    await this.quoteRepo.save(quote);

    return this.formatPolicyResponse(savedPolicy);
  }

  /**
   * Activate policy after payment confirmed
   */
  async activatePolicy(policyId: string, paymentId: string) {
    const policy = await this.policyRepo.findOne({ where: { id: policyId } });
    if (!policy) throw new NotFoundError('Policy không tìm thấy');

    if (policy.status !== 'pending') {
      throw new ValidationError(`Không thể kích hoạt policy ở trạng thái: ${policy.status}`);
    }

    policy.status = 'active';
    policy.activatedAt = new Date();
    policy.paymentId = paymentId;

    const saved = await this.policyRepo.save(policy);
    return this.formatPolicyResponse(saved);
  }

  /**
   * Cancel policy
   */
  async cancelPolicy(policyId: string, customerId: string, reason: string) {
    const policy = await this.policyRepo.findOne({
      where: { id: policyId, customerId },
    });
    if (!policy) throw new NotFoundError('Policy không tìm thấy');

    if (!['active', 'pending'].includes(policy.status)) {
      throw new ValidationError(`Không thể hủy policy ở trạng thái: ${policy.status}`);
    }

    // Calculate refund (pro-rata for active policies)
    let refundAmount = 0;
    if (policy.status === 'active') {
      const today = new Date();
      const start = new Date(policy.startDate);
      const end = new Date(policy.endDate);
      const totalDays = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
      const usedDays = (today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
      const remainingRatio = Math.max(0, (totalDays - usedDays) / totalDays);
      refundAmount = Math.round(Number(policy.premiumAnnual) * remainingRatio * 0.9); // 10% admin fee
    } else {
      refundAmount = Number(policy.premiumAnnual); // Full refund if pending
    }

    policy.status = 'cancelled';
    policy.cancelledAt = new Date();
    policy.cancellationReason = reason;

    const saved = await this.policyRepo.save(policy);

    return {
      ...this.formatPolicyResponse(saved),
      refund: {
        amount: refundAmount,
        currency: 'VND',
        method: 'original_payment',
        estimated_days: 7,
      },
    };
  }

  /**
   * Get policy by ID
   */
  async getPolicyById(policyId: string, customerId: string) {
    const policy = await this.policyRepo.findOne({
      where: { id: policyId, customerId },
      relations: ['insurer', 'beneficiaries'],
    });
    if (!policy) throw new NotFoundError('Policy không tìm thấy');
    return this.formatPolicyDetailResponse(policy);
  }

  /**
   * Get customer's policies
   */
  async getCustomerPolicies(customerId: string, filters: {
    status?: string;
    product_type?: string;
    page?: number;
    per_page?: number;
  }) {
    const page = filters.page || 1;
    const perPage = filters.per_page || 10;

    const queryBuilder = this.policyRepo
      .createQueryBuilder('policy')
      .leftJoinAndSelect('policy.insurer', 'insurer')
      .where('policy.customerId = :customerId', { customerId });

    if (filters.status) {
      queryBuilder.andWhere('policy.status = :status', { status: filters.status });
    }
    if (filters.product_type) {
      queryBuilder.andWhere('policy.productType = :productType', { productType: filters.product_type });
    }

    queryBuilder.orderBy('policy.createdAt', 'DESC');

    const [policies, total] = await queryBuilder
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return {
      data: policies.map((p) => this.formatPolicyResponse(p)),
      total,
      page,
      per_page: perPage,
    };
  }

  // --- Helpers ---

  private generatePolicyNumber(productType: string): string {
    const prefixes: Record<string, string> = {
      motor: 'POL-MOT',
      health: 'POL-HLT',
      travel: 'POL-TRV',
      life: 'POL-LIF',
    };
    const prefix = prefixes[productType] || 'POL';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private formatPolicyResponse(policy: Policy) {
    return {
      id: policy.id,
      policy_number: policy.policyNumber,
      product_type: policy.productType,
      status: policy.status,
      insurer: (policy as any).insurer
        ? {
            id: (policy as any).insurer.id,
            name: (policy as any).insurer.name,
            logo_url: (policy as any).insurer.logoUrl,
          }
        : undefined,
      premium_annual: { amount: policy.premiumAnnual, currency: 'VND' },
      premium_monthly: { amount: policy.premiumMonthly, currency: 'VND' },
      sum_insured: { amount: policy.sumInsured, currency: 'VND' },
      payment_frequency: policy.paymentFrequency,
      start_date: policy.startDate,
      end_date: policy.endDate,
      activated_at: policy.activatedAt,
      document_url: policy.documentUrl,
      created_at: policy.createdAt,
    };
  }

  private formatPolicyDetailResponse(policy: Policy) {
    return {
      ...this.formatPolicyResponse(policy),
      insured_info: policy.insuredInfo,
      coverage_details: policy.coverageDetails,
      deductible: { amount: policy.deductible, currency: 'VND' },
      beneficiaries: policy.beneficiaries?.map((b) => ({
        id: b.id,
        full_name: b.fullName,
        relationship: b.relationship,
        percentage: b.percentage,
      })),
      cancellation_reason: policy.cancellationReason,
      cancelled_at: policy.cancelledAt,
    };
  }
}
