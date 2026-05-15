import { ValidationError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/logger';

export interface HomeInsuranceQuoteInput {
  // Property info
  property_type: 'apartment' | 'house' | 'townhouse' | 'villa';
  ownership_status: 'owned' | 'rented' | 'mortgaged';
  construction_type: 'concrete' | 'brick' | 'wood' | 'mixed';
  year_built: number;
  total_area_sqm: number;
  floors: number;
  address: {
    province: string;
    district: string;
    ward?: string;
    street_address: string;
  };

  // Property value
  building_value: number; // VND
  contents_value: number; // VND

  // Coverage options
  coverage_type: 'basic' | 'standard' | 'comprehensive';
  additional_coverages?: string[]; // e.g., 'flood', 'earthquake', 'theft', 'liability'

  // Security features
  security_features?: string[]; // e.g., 'cctv', 'alarm', 'guard', 'fire_extinguisher'

  // Duration
  duration_months?: number; // default 12
}

export interface HomeInsuranceQuoteResult {
  building_premium: number;
  contents_premium: number;
  additional_premiums: Array<{ coverage: string; name: string; premium: number }>;
  discount_amount: number;
  discount_reasons: string[];
  base_premium: number;
  tax: number;
  total_premium: number;
  coverage_details: {
    building: { sum_insured: number; deductible: number };
    contents: { sum_insured: number; deductible: number };
    liability: { limit: number } | null;
    additional: Array<{ name: string; limit: number }>;
  };
  plan_name: string;
  duration_months: number;
}

// Base rates per 1000 VND of sum insured (annual)
const BASE_RATES = {
  building: {
    basic: 0.08,      // 0.08%
    standard: 0.12,   // 0.12%
    comprehensive: 0.18, // 0.18%
  },
  contents: {
    basic: 0.15,
    standard: 0.22,
    comprehensive: 0.30,
  },
};

// Construction type multipliers
const CONSTRUCTION_FACTORS: Record<string, number> = {
  concrete: 0.85,
  brick: 1.0,
  mixed: 1.15,
  wood: 1.5,
};

// Property type multipliers
const PROPERTY_TYPE_FACTORS: Record<string, number> = {
  apartment: 0.9,
  townhouse: 1.0,
  house: 1.05,
  villa: 1.1,
};

// Additional coverage rates (per 1000 VND)
const ADDITIONAL_RATES: Record<string, { rate: number; name: string; limit_ratio: number }> = {
  flood: { rate: 0.05, name: 'Ngập lụt', limit_ratio: 0.5 },
  earthquake: { rate: 0.03, name: 'Động đất', limit_ratio: 1.0 },
  theft: { rate: 0.08, name: 'Trộm cắp', limit_ratio: 0.3 },
  liability: { rate: 0.04, name: 'Trách nhiệm dân sự', limit_ratio: 0.2 },
  electrical: { rate: 0.02, name: 'Hư hỏng điện', limit_ratio: 0.1 },
  water_damage: { rate: 0.03, name: 'Hư hỏng do nước', limit_ratio: 0.2 },
  glass_breakage: { rate: 0.01, name: 'Vỡ kính', limit_ratio: 0.05 },
  temporary_housing: { rate: 0.02, name: 'Chi phí ở tạm', limit_ratio: 0.1 },
};

// Security discount factors
const SECURITY_DISCOUNTS: Record<string, number> = {
  cctv: 0.03,
  alarm: 0.05,
  guard: 0.04,
  fire_extinguisher: 0.02,
  smoke_detector: 0.03,
  sprinkler: 0.05,
  security_door: 0.02,
};

export class HomeInsurancePricingEngine {
  /**
   * Calculate home insurance quote
   */
  static calculate(input: HomeInsuranceQuoteInput): HomeInsuranceQuoteResult {
    this.validateInput(input);

    const durationMonths = input.duration_months || 12;
    const durationFactor = durationMonths / 12;

    // Get base rates for coverage type
    const buildingRate = BASE_RATES.building[input.coverage_type];
    const contentsRate = BASE_RATES.contents[input.coverage_type];

    // Apply construction and property type factors
    const constructionFactor = CONSTRUCTION_FACTORS[input.construction_type] || 1.0;
    const propertyFactor = PROPERTY_TYPE_FACTORS[input.property_type] || 1.0;

    // Age of building factor
    const ageFactor = this.getAgeFactor(input.year_built);

    // Location risk factor (simplified)
    const locationFactor = this.getLocationFactor(input.address.province);

    // Calculate building premium
    const buildingPremium = Math.round(
      (input.building_value / 1000) * buildingRate *
      constructionFactor * propertyFactor * ageFactor * locationFactor * durationFactor
    );

    // Calculate contents premium
    const contentsPremium = Math.round(
      (input.contents_value / 1000) * contentsRate *
      propertyFactor * durationFactor
    );

    // Calculate additional coverage premiums
    const totalInsuredValue = input.building_value + input.contents_value;
    const additionalPremiums = (input.additional_coverages || []).map(coverage => {
      const config = ADDITIONAL_RATES[coverage];
      if (!config) return { coverage, name: coverage, premium: 0 };

      const premium = Math.round(
        (totalInsuredValue / 1000) * config.rate * durationFactor
      );
      return { coverage, name: config.name, premium };
    }).filter(p => p.premium > 0);

    // Calculate security discounts
    const basePremiumBeforeDiscount = buildingPremium + contentsPremium +
      additionalPremiums.reduce((sum, p) => sum + p.premium, 0);

    let discountPercentage = 0;
    const discountReasons: string[] = [];

    for (const feature of (input.security_features || [])) {
      const discount = SECURITY_DISCOUNTS[feature];
      if (discount) {
        discountPercentage += discount;
        discountReasons.push(`${this.getSecurityFeatureName(feature)}: -${(discount * 100).toFixed(0)}%`);
      }
    }

    // Cap discount at 15%
    discountPercentage = Math.min(discountPercentage, 0.15);
    const discountAmount = Math.round(basePremiumBeforeDiscount * discountPercentage);

    const basePremium = basePremiumBeforeDiscount - discountAmount;
    const tax = Math.round(basePremium * 0.1); // 10% VAT
    const totalPremium = basePremium + tax;

    // Build coverage details
    const deductibleRatio = input.coverage_type === 'basic' ? 0.01 : input.coverage_type === 'standard' ? 0.005 : 0.002;

    const coverageDetails = {
      building: {
        sum_insured: input.building_value,
        deductible: Math.round(input.building_value * deductibleRatio),
      },
      contents: {
        sum_insured: input.contents_value,
        deductible: Math.round(input.contents_value * deductibleRatio),
      },
      liability: (input.additional_coverages || []).includes('liability')
        ? { limit: Math.round(totalInsuredValue * 0.2) }
        : null,
      additional: (input.additional_coverages || []).map(c => {
        const config = ADDITIONAL_RATES[c];
        if (!config) return { name: c, limit: 0 };
        return { name: config.name, limit: Math.round(totalInsuredValue * config.limit_ratio) };
      }).filter(a => a.limit > 0),
    };

    const planNames = { basic: 'Gói Cơ bản', standard: 'Gói Tiêu chuẩn', comprehensive: 'Gói Toàn diện' };

    logger.info(`[HomeInsurance] Quote calculated: ${totalPremium} VND for ${input.property_type} in ${input.address.province}`);

    return {
      building_premium: buildingPremium,
      contents_premium: contentsPremium,
      additional_premiums: additionalPremiums,
      discount_amount: discountAmount,
      discount_reasons: discountReasons,
      base_premium: basePremium,
      tax,
      total_premium: totalPremium,
      coverage_details: coverageDetails,
      plan_name: planNames[input.coverage_type],
      duration_months: durationMonths,
    };
  }

  /**
   * Get available coverage plans comparison
   */
  static getPlansComparison(buildingValue: number, contentsValue: number) {
    const plans = (['basic', 'standard', 'comprehensive'] as const).map(type => {
      const result = this.calculate({
        property_type: 'house',
        ownership_status: 'owned',
        construction_type: 'brick',
        year_built: 2015,
        total_area_sqm: 100,
        floors: 2,
        address: { province: 'Hà Nội', district: 'Cầu Giấy', street_address: '' },
        building_value: buildingValue,
        contents_value: contentsValue,
        coverage_type: type,
      });

      return {
        type,
        name: result.plan_name,
        total_premium: result.total_premium,
        features: this.getPlanFeatures(type),
      };
    });

    return plans;
  }

  private static validateInput(input: HomeInsuranceQuoteInput): void {
    if (input.building_value <= 0 && input.contents_value <= 0) {
      throw new ValidationError('Giá trị tài sản phải lớn hơn 0');
    }
    if (input.building_value > 100000000000) {
      throw new ValidationError('Giá trị nhà tối đa 100 tỷ VND');
    }
    if (input.total_area_sqm <= 0 || input.total_area_sqm > 10000) {
      throw new ValidationError('Diện tích không hợp lệ');
    }
    if (input.year_built < 1950 || input.year_built > new Date().getFullYear()) {
      throw new ValidationError('Năm xây dựng không hợp lệ');
    }
  }

  private static getAgeFactor(yearBuilt: number): number {
    const age = new Date().getFullYear() - yearBuilt;
    if (age <= 5) return 0.9;
    if (age <= 10) return 1.0;
    if (age <= 20) return 1.1;
    if (age <= 30) return 1.25;
    return 1.4;
  }

  private static getLocationFactor(province: string): number {
    // Higher risk areas (flood-prone, etc.)
    const highRisk = ['Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng'];
    const mediumRisk = ['Hải Phòng', 'Cần Thơ', 'Huế', 'Nha Trang'];

    if (highRisk.includes(province)) return 1.1;
    if (mediumRisk.includes(province)) return 1.05;
    return 1.0;
  }

  private static getSecurityFeatureName(feature: string): string {
    const names: Record<string, string> = {
      cctv: 'Camera an ninh',
      alarm: 'Hệ thống báo động',
      guard: 'Bảo vệ 24/7',
      fire_extinguisher: 'Bình chữa cháy',
      smoke_detector: 'Đầu báo khói',
      sprinkler: 'Sprinkler PCCC',
      security_door: 'Cửa an ninh',
    };
    return names[feature] || feature;
  }

  private static getPlanFeatures(type: 'basic' | 'standard' | 'comprehensive'): string[] {
    const features: Record<string, string[]> = {
      basic: ['Hỏa hoạn & nổ', 'Thiên tai (bão, lũ)', 'Sét đánh', 'Va chạm xe cộ'],
      standard: ['Tất cả gói Cơ bản', 'Hư hỏng đường ống nước', 'Trộm cắp (hạn chế)', 'Vỡ kính', 'Trách nhiệm bên thứ 3 (giới hạn)'],
      comprehensive: ['Tất cả gói Tiêu chuẩn', 'Mọi rủi ro bất ngờ', 'Trộm cắp (toàn diện)', 'Hư hỏng điện', 'Chi phí ở tạm', 'Trách nhiệm dân sự mở rộng', 'Vật dụng cá nhân'],
    };
    return features[type] || [];
  }
}
