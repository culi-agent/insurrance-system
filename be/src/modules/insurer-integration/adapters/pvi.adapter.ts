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
 * PVI Insurance - Adapter Implementation
 * Sprint 3: Full motor insurance integration with vehicle-based pricing.
 * In production, this would call PVI's actual API endpoints.
 */
export class PviAdapter extends BaseInsurerAdapter {
  readonly insurerCode = 'PVI';
  readonly insurerName = 'PVI Insurance';
  readonly supportedTypes = ['motor', 'health', 'travel', 'property', 'business'];
  readonly rating = 4.3;

  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config?: { baseUrl?: string; apiKey?: string }) {
    super();
    this.baseUrl = config?.baseUrl || process.env.PVI_API_URL || 'https://api.pvi.com.vn';
    this.apiKey = config?.apiKey || process.env.PVI_API_KEY || '';
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    logger.info(`[PVI] Generating quote for ${request.insurance_type}`);

    if (request.insurance_type === 'motor') {
      return this.calculateMotorQuote(request);
    }

    // Generic pricing for other types
    const basePremium = this.calculateGenericPremium(request);
    const discount = basePremium * 0.08;
    const tax = (basePremium - discount) * 0.1;
    const totalPremium = Math.round(basePremium - discount + tax);

    return {
      insurer_code: this.insurerCode,
      insurer_name: this.insurerName,
      product_name: `PVI - ${this.getProductName(request.insurance_type)}`,
      base_premium: basePremium,
      discount: Math.round(discount),
      tax: Math.round(tax),
      total_premium: totalPremium,
      premium_breakdown: [
        { item: 'Phí bảo hiểm cơ bản', amount: basePremium },
        { item: 'Giảm giá mua online (8%)', amount: -Math.round(discount) },
        { item: 'VAT (10%)', amount: Math.round(tax) },
      ],
      coverage_details: this.getGenericCoverageDetails(request),
      valid_until: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      metadata: {
        provider: 'pvi',
        quote_ref: `PVI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        rating: this.rating,
      },
    };
  }

  /**
   * Motor-specific quote calculation using vehicle data
   * PVI tends to be slightly cheaper on comprehensive, but higher on TNDS
   */
  private calculateMotorQuote(request: QuoteRequest): QuoteResponse {
    const input = request.input_data;
    const coverage = request.coverage_options;

    // TNDS calculation - PVI slightly higher
    let tndsPremium = 0;
    if (coverage.coverage_type === 'tnds' || coverage.coverage_type === 'both') {
      tndsPremium = this.calculateTnds(input);
    }

    // Comprehensive - PVI competitive rate at 1.4%
    let comprehensivePremium = 0;
    if (coverage.coverage_type === 'comprehensive' || coverage.coverage_type === 'both') {
      comprehensivePremium = this.calculateComprehensive(input);
    }

    // Additional coverage
    let additionalPremium = 0;
    if (coverage.additional_coverage) {
      additionalPremium = this.calculateAdditional(input, coverage.additional_coverage);
    }

    // Duration
    const years = (coverage.coverage_duration || 12) / 12;
    const subtotal = Math.round((tndsPremium + comprehensivePremium + additionalPremium) * years);

    // PVI discount: 8% online + loyalty
    let discountRate = 0.08; // Higher base online discount than Bao Viet
    if (input.no_claims_years >= 3) discountRate += 0.08;
    else if (input.no_claims_years >= 1) discountRate += 0.04;
    if (input.has_garage) discountRate += 0.03;
    if (input.has_dashcam) discountRate += 0.03;
    discountRate = Math.min(discountRate, 0.28);

    const discount = Math.round(subtotal * discountRate);
    const taxableAmount = (comprehensivePremium + additionalPremium) * years - discount;
    const tax = Math.round(Math.max(0, taxableAmount) * 0.1);
    const totalPremium = Math.round(subtotal - discount + tax);

    const coverageDetails = [];
    if (tndsPremium > 0) {
      coverageDetails.push({
        name: 'TNDS bắt buộc',
        sum_insured: input.vehicle_type === 'motorcycle' ? 150000000 : 500000000,
        description: 'Trách nhiệm dân sự bắt buộc theo NĐ 03/2021',
      });
    }
    if (comprehensivePremium > 0) {
      coverageDetails.push({
        name: 'Thiệt hại vật chất xe',
        sum_insured: input.vehicle_value || 500000000,
        description: 'Bồi thường toàn bộ/một phần thiệt hại xe',
      });
    }
    coverageDetails.push({
      name: 'Mất cắp toàn bộ',
      sum_insured: Math.round((input.vehicle_value || 500000000) * 0.7),
      description: 'Bồi thường mất cắp toàn bộ xe',
    });

    return {
      insurer_code: this.insurerCode,
      insurer_name: this.insurerName,
      product_name: 'PVI - Xe An Toàn Plus',
      base_premium: subtotal,
      discount,
      tax,
      total_premium: totalPremium,
      premium_breakdown: [
        { item: 'TNDS bắt buộc', amount: Math.round(tndsPremium * years) },
        { item: 'Thiệt hại vật chất xe', amount: Math.round(comprehensivePremium * years) },
        { item: 'Bảo hiểm bổ sung', amount: Math.round(additionalPremium * years) },
        { item: `Ưu đãi online (${Math.round(discountRate * 100)}%)`, amount: -discount },
        { item: 'VAT (10%)', amount: tax },
      ],
      coverage_details: coverageDetails,
      valid_until: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      metadata: {
        provider: 'pvi',
        quote_ref: `PVI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        rating: this.rating,
        features: ['Giám định tại chỗ 30 phút', 'Bồi thường không cần hóa đơn dưới 2 triệu', 'Cứu hộ 24/7'],
      },
    };
  }

  private calculateTnds(input: Record<string, any>): number {
    // PVI TNDS rates - slightly different from Bao Viet
    const rates: Record<string, number> = {
      motorcycle: 67000,
      car: 490000,
      truck: 780000,
      bus: 1160000,
    };
    let base = rates[input.vehicle_type] || 490000;

    if (input.vehicle_type === 'car' || input.vehicle_type === 'bus') {
      if (input.seats > 24) base = 1520000;
      else if (input.seats > 11) base = 1160000;
      else if (input.seats > 6) base = 860000;
    }

    if (input.usage === 'commercial') base *= 1.25;
    else if (input.usage === 'taxi') base *= 1.45;

    return Math.round(base);
  }

  private calculateComprehensive(input: Record<string, any>): number {
    const vehicleValue = input.vehicle_value || 500000000;
    // PVI slightly lower comprehensive rate
    let rate = 0.014; // 1.4% for personal (vs 1.5% Bao Viet)

    if (input.usage === 'commercial') rate = 0.019;
    else if (input.usage === 'taxi') rate = 0.024;

    // Depreciation
    const age = new Date().getFullYear() - (input.vehicle_year || 2020);
    let depFactor = 1.0;
    if (age <= 1) depFactor = 1.0;
    else if (age <= 3) depFactor = 0.87;
    else if (age <= 6) depFactor = 0.72;
    else depFactor = 0.52;

    return Math.round(vehicleValue * depFactor * rate);
  }

  private calculateAdditional(input: Record<string, any>, additional: Record<string, any>): number {
    let total = 0;
    const vehicleValue = input.vehicle_value || 500000000;

    if (additional.passenger_accident) total += 18000 * (input.seats || 5); // Slightly cheaper
    if (additional.flood_damage) total += vehicleValue * 0.0012;
    if (additional.scratch_damage) total += vehicleValue * 0.0018; // Cheaper
    if (additional.theft) total += vehicleValue * 0.0028; // Cheaper

    return Math.round(total);
  }

  async issuePolicy(request: PolicyRequest): Promise<PolicyResponse> {
    logger.info(`[PVI] Issuing policy for quote ${request.quote_id}`);

    const policyNumber = `PVI-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    return {
      policy_number: policyNumber,
      status: 'active',
      document_url: `https://docs.pvi.com.vn/policy/${policyNumber}.pdf`,
      effective_date: request.start_date,
      expiry_date: request.end_date,
      metadata: {
        issued_at: new Date().toISOString(),
        insurer: this.insurerCode,
      },
    };
  }

  async submitClaim(request: ClaimRequest): Promise<ClaimResponse> {
    logger.info(`[PVI] Submitting claim for policy ${request.policy_number}`);

    return {
      claim_number: `PVI-CLM-${Date.now()}`,
      status: 'submitted',
      estimated_settlement: request.amount_claimed * 0.85,
      message: 'Hồ sơ bồi thường đã được tiếp nhận.',
    };
  }

  async healthCheck(): Promise<InsurerHealth> {
    const start = Date.now();
    return {
      status: 'healthy',
      response_time_ms: Date.now() - start + Math.random() * 30,
      last_checked: new Date(),
      message: 'OK',
    };
  }

  private calculateGenericPremium(request: QuoteRequest): number {
    const typeMultipliers: Record<string, number> = {
      motor: 0.9,
      health: 1.4,
      travel: 0.45,
      property: 1.1,
      business: 2.5,
    };
    const multiplier = typeMultipliers[request.insurance_type] || 1.0;
    return Math.round(2200000 * multiplier);
  }

  private getProductName(type: string): string {
    const names: Record<string, string> = {
      motor: 'Xe An Toàn Plus',
      health: 'Sức Khỏe Vàng',
      travel: 'Du Lịch An Tâm',
      property: 'Nhà An Toàn',
      business: 'Doanh Nghiệp Bền Vững',
    };
    return names[type] || 'Bảo hiểm PVI';
  }

  private getGenericCoverageDetails(request: QuoteRequest) {
    const coverage: Record<string, any[]> = {
      health: [
        { name: 'Nội trú', sum_insured: 250000000, description: 'Chi phí điều trị nội trú' },
        { name: 'Ngoại trú', sum_insured: 60000000, description: 'Chi phí khám chữa bệnh' },
        { name: 'Nha khoa', sum_insured: 10000000, description: 'Chi phí nha khoa' },
      ],
      travel: [
        { name: 'Y tế quốc tế', sum_insured: 2000000000, description: 'Chi phí y tế toàn cầu' },
        { name: 'Hành lý', sum_insured: 40000000, description: 'Mất mát hành lý' },
        { name: 'Trễ chuyến', sum_insured: 10000000, description: 'Bồi thường trễ chuyến bay' },
      ],
    };
    return coverage[request.insurance_type] || [];
  }
}
