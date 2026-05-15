/**
 * Motor Insurance Quote Engine
 * Calculates premium based on vehicle info and coverage options
 */

export interface MotorQuoteInput {
  // Vehicle information
  vehicle_type: 'car' | 'motorcycle' | 'truck' | 'bus';
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  license_plate: string;
  engine_capacity: number; // cc
  vehicle_value: number; // VND
  seats: number;
  usage: 'personal' | 'commercial' | 'taxi';

  // Owner information
  owner_name: string;
  owner_id_number?: string;
  owner_phone?: string;

  // Coverage options
  coverage_type: 'tnds' | 'comprehensive' | 'both'; // TNDS bắt buộc, Vật chất xe, Cả hai
  coverage_duration: number; // months (12, 24, 36)
  additional_coverage?: {
    passenger_accident?: boolean; // Tai nạn người ngồi trên xe
    flood_damage?: boolean; // Ngập nước
    scratch_damage?: boolean; // Trầy xước
    theft?: boolean; // Trộm cắp
  };

  // Discount factors
  no_claims_years?: number; // Số năm không khiếu nại
  has_garage?: boolean; // Có garage
  has_dashcam?: boolean; // Có camera hành trình
}

export interface QuoteResult {
  base_premium: number;
  discount: number;
  tax: number;
  total_premium: number;
  premium_breakdown: PremiumBreakdown;
  coverage_details: CoverageDetail[];
  valid_until: string;
}

export interface PremiumBreakdown {
  tnds_premium: number;
  comprehensive_premium: number;
  additional_premium: number;
  subtotal: number;
  discount_amount: number;
  vat: number;
  total: number;
}

export interface CoverageDetail {
  name: string;
  description: string;
  coverage_amount: number;
  premium: number;
}

// Base rates (VND per year)
const TNDS_BASE_RATES: Record<string, number> = {
  motorcycle: 66000, // Xe máy
  car_under_6: 480000, // Ô tô <= 6 chỗ
  car_6_11: 840000, // Ô tô 6-11 chỗ
  car_12_24: 1140000, // Ô tô 12-24 chỗ
  car_over_24: 1500000, // Ô tô > 24 chỗ
  truck_under_3t: 750000, // Xe tải < 3 tấn
  truck_3_8t: 1050000, // Xe tải 3-8 tấn
  truck_over_8t: 1350000, // Xe tải > 8 tấn
};

// Comprehensive rate as % of vehicle value
const COMPREHENSIVE_RATES: Record<string, number> = {
  personal: 0.015, // 1.5% giá trị xe
  commercial: 0.02, // 2.0%
  taxi: 0.025, // 2.5%
};

// Additional coverage rates
const ADDITIONAL_RATES = {
  passenger_accident: 20000, // Per seat per year
  flood_damage: 0.001, // 0.1% of vehicle value
  scratch_damage: 0.002, // 0.2% of vehicle value
  theft: 0.003, // 0.3% of vehicle value
};

// Discount factors
const DISCOUNT_FACTORS = {
  no_claims_1: 0.05, // 5% discount for 1 year no claims
  no_claims_2: 0.1, // 10%
  no_claims_3: 0.15, // 15%
  no_claims_5: 0.2, // 20%
  has_garage: 0.03, // 3%
  has_dashcam: 0.02, // 2%
  long_term_24: 0.05, // 5% for 2-year policy
  long_term_36: 0.1, // 10% for 3-year policy
};

export class QuoteEngineService {
  /**
   * Calculate motor insurance quote
   */
  static calculateMotorQuote(input: MotorQuoteInput): QuoteResult {
    const coverageDetails: CoverageDetail[] = [];
    let tndsPremium = 0;
    let comprehensivePremium = 0;
    let additionalPremium = 0;

    // 1. Calculate TNDS (compulsory liability)
    if (input.coverage_type === 'tnds' || input.coverage_type === 'both') {
      tndsPremium = this.calculateTndsPremium(input);
      coverageDetails.push({
        name: 'TNDS bắt buộc',
        description: 'Bảo hiểm trách nhiệm dân sự của chủ xe cơ giới',
        coverage_amount: input.vehicle_type === 'motorcycle' ? 150000000 : 500000000,
        premium: tndsPremium,
      });
    }

    // 2. Calculate Comprehensive (voluntary)
    if (input.coverage_type === 'comprehensive' || input.coverage_type === 'both') {
      comprehensivePremium = this.calculateComprehensivePremium(input);
      coverageDetails.push({
        name: 'Bảo hiểm vật chất xe',
        description: 'Bảo hiểm thiệt hại vật chất cho xe',
        coverage_amount: input.vehicle_value,
        premium: comprehensivePremium,
      });
    }

    // 3. Calculate additional coverage
    if (input.additional_coverage) {
      const additionalResult = this.calculateAdditionalPremium(input);
      additionalPremium = additionalResult.total;
      coverageDetails.push(...additionalResult.details);
    }

    // 4. Calculate for duration (multiply by years)
    const years = input.coverage_duration / 12;
    const subtotal = (tndsPremium + comprehensivePremium + additionalPremium) * years;

    // 5. Calculate discounts
    const discountRate = this.calculateDiscountRate(input);
    const discountAmount = Math.round(subtotal * discountRate);

    // 6. Calculate VAT (10% on non-TNDS)
    const taxableAmount = (comprehensivePremium + additionalPremium) * years - discountAmount;
    const vat = Math.round(Math.max(0, taxableAmount) * 0.1);

    // 7. Total
    const total = Math.round(subtotal - discountAmount + vat);

    const premiumBreakdown: PremiumBreakdown = {
      tnds_premium: Math.round(tndsPremium * years),
      comprehensive_premium: Math.round(comprehensivePremium * years),
      additional_premium: Math.round(additionalPremium * years),
      subtotal: Math.round(subtotal),
      discount_amount: discountAmount,
      vat,
      total,
    };

    // Quote valid for 7 days
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return {
      base_premium: Math.round(subtotal),
      discount: discountAmount,
      tax: vat,
      total_premium: total,
      premium_breakdown: premiumBreakdown,
      coverage_details: coverageDetails,
      valid_until: validUntil.toISOString(),
    };
  }

  private static calculateTndsPremium(input: MotorQuoteInput): number {
    let rateKey: string;

    if (input.vehicle_type === 'motorcycle') {
      rateKey = 'motorcycle';
    } else if (input.vehicle_type === 'truck') {
      if (input.engine_capacity < 3000) rateKey = 'truck_under_3t';
      else if (input.engine_capacity < 8000) rateKey = 'truck_3_8t';
      else rateKey = 'truck_over_8t';
    } else {
      // Car/Bus
      if (input.seats <= 6) rateKey = 'car_under_6';
      else if (input.seats <= 11) rateKey = 'car_6_11';
      else if (input.seats <= 24) rateKey = 'car_12_24';
      else rateKey = 'car_over_24';
    }

    return TNDS_BASE_RATES[rateKey] || TNDS_BASE_RATES['car_under_6'];
  }

  private static calculateComprehensivePremium(input: MotorQuoteInput): number {
    const rate = COMPREHENSIVE_RATES[input.usage] || COMPREHENSIVE_RATES['personal'];

    // Depreciation factor based on vehicle age
    const vehicleAge = new Date().getFullYear() - input.vehicle_year;
    let depreciationFactor = 1.0;
    if (vehicleAge <= 1) depreciationFactor = 1.0;
    else if (vehicleAge <= 3) depreciationFactor = 0.85;
    else if (vehicleAge <= 5) depreciationFactor = 0.7;
    else if (vehicleAge <= 8) depreciationFactor = 0.55;
    else depreciationFactor = 0.4;

    const adjustedValue = input.vehicle_value * depreciationFactor;
    return Math.round(adjustedValue * rate);
  }

  private static calculateAdditionalPremium(input: MotorQuoteInput): {
    total: number;
    details: CoverageDetail[];
  } {
    const details: CoverageDetail[] = [];
    let total = 0;

    if (input.additional_coverage?.passenger_accident) {
      const premium = ADDITIONAL_RATES.passenger_accident * input.seats;
      total += premium;
      details.push({
        name: 'Tai nạn người ngồi trên xe',
        description: `Bảo hiểm tai nạn cho ${input.seats} chỗ ngồi`,
        coverage_amount: 10000000 * input.seats, // 10M per seat
        premium,
      });
    }

    if (input.additional_coverage?.flood_damage) {
      const premium = Math.round(input.vehicle_value * ADDITIONAL_RATES.flood_damage);
      total += premium;
      details.push({
        name: 'Ngập nước',
        description: 'Bảo hiểm thiệt hại do ngập nước',
        coverage_amount: input.vehicle_value,
        premium,
      });
    }

    if (input.additional_coverage?.scratch_damage) {
      const premium = Math.round(input.vehicle_value * ADDITIONAL_RATES.scratch_damage);
      total += premium;
      details.push({
        name: 'Trầy xước, bể kính',
        description: 'Bảo hiểm trầy xước sơn và bể kính',
        coverage_amount: Math.round(input.vehicle_value * 0.1),
        premium,
      });
    }

    if (input.additional_coverage?.theft) {
      const premium = Math.round(input.vehicle_value * ADDITIONAL_RATES.theft);
      total += premium;
      details.push({
        name: 'Trộm cắp',
        description: 'Bảo hiểm mất cắp toàn bộ xe',
        coverage_amount: input.vehicle_value,
        premium,
      });
    }

    return { total, details };
  }

  private static calculateDiscountRate(input: MotorQuoteInput): number {
    let discount = 0;

    // No claims discount
    if (input.no_claims_years) {
      if (input.no_claims_years >= 5) discount += DISCOUNT_FACTORS.no_claims_5;
      else if (input.no_claims_years >= 3) discount += DISCOUNT_FACTORS.no_claims_3;
      else if (input.no_claims_years >= 2) discount += DISCOUNT_FACTORS.no_claims_2;
      else if (input.no_claims_years >= 1) discount += DISCOUNT_FACTORS.no_claims_1;
    }

    // Garage discount
    if (input.has_garage) discount += DISCOUNT_FACTORS.has_garage;

    // Dashcam discount
    if (input.has_dashcam) discount += DISCOUNT_FACTORS.has_dashcam;

    // Long-term discount
    if (input.coverage_duration >= 36) discount += DISCOUNT_FACTORS.long_term_36;
    else if (input.coverage_duration >= 24) discount += DISCOUNT_FACTORS.long_term_24;

    // Cap discount at 30%
    return Math.min(discount, 0.3);
  }
}
