import {
  BaseInsurerAdapter,
  QuoteRequest,
  QuoteResponse,
  PolicyRequest,
  PolicyResponse,
  ClaimRequest,
  ClaimResponse,
  InsurerHealth,
} from './base.adapter';
import { logger } from '../../../shared/utils/logger';

/**
 * Bao Viet Insurance - Adapter Implementation
 * Sprint 3: Full motor insurance integration with vehicle-based pricing.
 * In production, this would call Bao Viet's actual API endpoints.
 */
export class BaoVietAdapter extends BaseInsurerAdapter {
  readonly insurerCode = 'BAO_VIET';
  readonly insurerName = 'Bảo Việt';
  readonly supportedTypes = ['motor', 'health', 'travel', 'property', 'life'];
  readonly rating = 4.5;

  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config?: { baseUrl?: string; apiKey?: string }) {
    super();
    this.baseUrl = config?.baseUrl || process.env.BAO_VIET_API_URL || 'https://api.baoviet.com.vn';
    this.apiKey = config?.apiKey || process.env.BAO_VIET_API_KEY || '';
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    logger.info(`[BaoViet] Generating quote for ${request.insurance_type}`);

    if (request.insurance_type === 'motor') {
      return this.calculateMotorQuote(request);
    }

    // Generic pricing for other types
    const basePremium = this.calculateGenericPremium(request);
    const discount = basePremium * 0.05;
    const tax = (basePremium - discount) * 0.1;
    const totalPremium = Math.round(basePremium - discount + tax);

    return {
      insurer_code: this.insurerCode,
      insurer_name: this.insurerName,
      product_name: `Bảo Việt - ${this.getProductName(request.insurance_type)}`,
      base_premium: basePremium,
      discount: Math.round(discount),
      tax: Math.round(tax),
      total_premium: totalPremium,
      premium_breakdown: [
        { item: 'Phí bảo hiểm cơ bản', amount: basePremium },
        { item: 'Giảm giá đặt sớm (5%)', amount: -Math.round(discount) },
        { item: 'VAT (10%)', amount: Math.round(tax) },
      ],
      coverage_details: this.getGenericCoverageDetails(request),
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      metadata: {
        provider: 'bao_viet',
        quote_ref: `BV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        rating: this.rating,
      },
    };
  }

  /**
   * Motor-specific quote calculation using vehicle data
   */
  private calculateMotorQuote(request: QuoteRequest): QuoteResponse {
    const input = request.input_data;
    const coverage = request.coverage_options;

    // TNDS (compulsory liability) calculation
    let tndsPremium = 0;
    if (coverage.coverage_type === 'tnds' || coverage.coverage_type === 'both') {
      tndsPremium = this.calculateTnds(input);
    }

    // Comprehensive (voluntary body damage) calculation
    let comprehensivePremium = 0;
    if (coverage.coverage_type === 'comprehensive' || coverage.coverage_type === 'both') {
      comprehensivePremium = this.calculateComprehensive(input);
    }

    // Additional coverage
    let additionalPremium = 0;
    if (coverage.additional_coverage) {
      additionalPremium = this.calculateAdditional(input, coverage.additional_coverage);
    }

    // Duration multiplier
    const years = (coverage.coverage_duration || 12) / 12;
    const subtotal = Math.round((tndsPremium + comprehensivePremium + additionalPremium) * years);

    // Bao Viet discount: 5% early bird + no-claims
    let discountRate = 0.05; // Base online discount
    if (input.no_claims_years >= 3) discountRate += 0.10;
    else if (input.no_claims_years >= 1) discountRate += 0.05;
    if (input.has_dashcam) discountRate += 0.02;
    discountRate = Math.min(discountRate, 0.25);

    const discount = Math.round(subtotal * discountRate);
    const taxableAmount = (comprehensivePremium + additionalPremium) * years - discount;
    const tax = Math.round(Math.max(0, taxableAmount) * 0.1);
    const totalPremium = Math.round(subtotal - discount + tax);

    const coverageDetails = [];
    if (tndsPremium > 0) {
      coverageDetails.push({
        name: 'TNDS bắt buộc',
        sum_insured: input.vehicle_type === 'motorcycle' ? 150000000 : 500000000,
        description: 'Trách nhiệm dân sự bắt buộc theo quy định',
      });
    }
    if (comprehensivePremium > 0) {
      coverageDetails.push({
        name: 'Vật chất xe',
        sum_insured: input.vehicle_value || 500000000,
        description: 'Bồi thường toàn bộ thiệt hại vật chất xe',
      });
    }
    coverageDetails.push({
      name: 'Tai nạn lái xe & người ngồi trên xe',
      sum_insured: 50000000,
      description: 'Bảo hiểm tai nạn cho người trên xe',
    });

    return {
      insurer_code: this.insurerCode,
      insurer_name: this.insurerName,
      product_name: 'Bảo Việt - Xe Cơ Giới Toàn Diện',
      base_premium: subtotal,
      discount,
      tax,
      total_premium: totalPremium,
      premium_breakdown: [
        { item: 'TNDS bắt buộc', amount: Math.round(tndsPremium * years) },
        { item: 'Bảo hiểm vật chất xe', amount: Math.round(comprehensivePremium * years) },
        { item: 'Bảo hiểm bổ sung', amount: Math.round(additionalPremium * years) },
        { item: `Giảm giá (${Math.round(discountRate * 100)}%)`, amount: -discount },
        { item: 'VAT (10%)', amount: tax },
      ],
      coverage_details: coverageDetails,
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      metadata: {
        provider: 'bao_viet',
        quote_ref: `BV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        rating: this.rating,
        features: ['Hỗ trợ 24/7', 'Bồi thường nhanh 3 ngày', 'Garage ưu tiên toàn quốc'],
      },
    };
  }

  private calculateTnds(input: Record<string, any>): number {
    const rates: Record<string, number> = {
      motorcycle: 66000,
      car: 480000,
      truck: 750000,
      bus: 1140000,
    };
    let base = rates[input.vehicle_type] || 480000;

    // Adjust by seats for car/bus
    if (input.vehicle_type === 'car' || input.vehicle_type === 'bus') {
      if (input.seats > 24) base = 1500000;
      else if (input.seats > 11) base = 1140000;
      else if (input.seats > 6) base = 840000;
    }

    // Commercial usage surcharge
    if (input.usage === 'commercial') base *= 1.3;
    else if (input.usage === 'taxi') base *= 1.5;

    return Math.round(base);
  }

  private calculateComprehensive(input: Record<string, any>): number {
    const vehicleValue = input.vehicle_value || 500000000;
    let rate = 0.015; // 1.5% for personal

    if (input.usage === 'commercial') rate = 0.02;
    else if (input.usage === 'taxi') rate = 0.025;

    // Depreciation based on vehicle age
    const age = new Date().getFullYear() - (input.vehicle_year || 2020);
    let depFactor = 1.0;
    if (age <= 1) depFactor = 1.0;
    else if (age <= 3) depFactor = 0.85;
    else if (age <= 6) depFactor = 0.7;
    else depFactor = 0.5;

    return Math.round(vehicleValue * depFactor * rate);
  }

  private calculateAdditional(input: Record<string, any>, additional: Record<string, any>): number {
    let total = 0;
    const vehicleValue = input.vehicle_value || 500000000;

    if (additional.passenger_accident) total += 20000 * (input.seats || 5);
    if (additional.flood_damage) total += vehicleValue * 0.001;
    if (additional.scratch_damage) total += vehicleValue * 0.002;
    if (additional.theft) total += vehicleValue * 0.003;

    return Math.round(total);
  }

  async issuePolicy(request: PolicyRequest): Promise<PolicyResponse> {
    logger.info(`[BaoViet] Issuing policy for quote ${request.quote_id}`);

    const policyNumber = `BV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    return {
      policy_number: policyNumber,
      status: 'active',
      document_url: `https://docs.baoviet.com.vn/policy/${policyNumber}.pdf`,
      effective_date: request.start_date,
      expiry_date: request.end_date,
      metadata: {
        issued_at: new Date().toISOString(),
        insurer: this.insurerCode,
      },
    };
  }

  async submitClaim(request: ClaimRequest): Promise<ClaimResponse> {
    logger.info(`[BaoViet] Submitting claim for policy ${request.policy_number}`);

    return {
      claim_number: `BV-CLM-${Date.now()}`,
      status: 'submitted',
      estimated_settlement: request.amount_claimed * 0.8,
      message: 'Yêu cầu bồi thường đã được tiếp nhận. Chúng tôi sẽ xử lý trong 3-5 ngày làm việc.',
    };
  }

  async healthCheck(): Promise<InsurerHealth> {
    const start = Date.now();
    return {
      status: 'healthy',
      response_time_ms: Date.now() - start + Math.random() * 50,
      last_checked: new Date(),
      message: 'All systems operational',
    };
  }

  private calculateGenericPremium(request: QuoteRequest): number {
    const typeMultipliers: Record<string, number> = {
      motor: 1.0,
      health: 1.5,
      travel: 0.5,
      property: 1.2,
      life: 2.0,
    };
    const multiplier = typeMultipliers[request.insurance_type] || 1.0;
    return Math.round(2000000 * multiplier);
  }

  private getProductName(type: string): string {
    const names: Record<string, string> = {
      motor: 'Xe Cơ Giới Toàn Diện',
      health: 'Sức Khỏe An Tâm',
      travel: 'Du Lịch Toàn Cầu',
      property: 'Nhà Tư Nhân',
      life: 'Nhân Thọ Phú Quý',
    };
    return names[type] || 'Bảo hiểm toàn diện';
  }

  private getGenericCoverageDetails(request: QuoteRequest) {
    const coverage: Record<string, any[]> = {
      health: [
        { name: 'Nội trú', sum_insured: 200000000, description: 'Chi phí nằm viện' },
        { name: 'Ngoại trú', sum_insured: 50000000, description: 'Chi phí khám ngoại trú' },
        { name: 'Phẫu thuật', sum_insured: 300000000, description: 'Chi phí phẫu thuật' },
      ],
      travel: [
        { name: 'Chi phí y tế', sum_insured: 1000000000, description: 'Chi phí y tế ở nước ngoài' },
        { name: 'Hành lý', sum_insured: 30000000, description: 'Mất/hư hỏng hành lý' },
        { name: 'Hủy chuyến', sum_insured: 50000000, description: 'Chi phí hủy chuyến' },
      ],
    };
    return coverage[request.insurance_type] || [];
  }
}
