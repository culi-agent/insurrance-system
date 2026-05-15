/**
 * Health Insurance Quote Engine
 * Sprint 7: Calculates premium for health insurance based on personal/medical info
 */

export interface HealthQuoteInput {
  // Plan selection
  plan_type: 'basic' | 'standard' | 'premium' | 'platinum';
  coverage_type: 'inpatient' | 'outpatient' | 'comprehensive'; // Nội trú, Ngoại trú, Toàn diện

  // Personal info
  applicant: {
    full_name: string;
    date_of_birth: string;
    gender: 'male' | 'female';
    occupation: string;
    id_number?: string;
    phone?: string;
    email?: string;
  };

  // Family plan
  is_family_plan: boolean;
  family_members?: Array<{
    full_name: string;
    date_of_birth: string;
    gender: 'male' | 'female';
    relationship: 'spouse' | 'child' | 'parent';
  }>;

  // Health declaration
  health_declaration: {
    height_cm: number;
    weight_kg: number;
    is_smoker: boolean;
    is_drinker: boolean;
    has_pre_existing_conditions: boolean;
    pre_existing_conditions?: string[];
    has_hospitalized_last_5years: boolean;
    hospitalization_details?: string;
    is_on_medication: boolean;
    medication_details?: string;
    has_family_history: boolean;
    family_history_conditions?: string[];
  };

  // Coverage options
  coverage_options: {
    annual_limit: number;         // Hạn mức năm
    deductible: number;           // Mức miễn thường
    room_type: 'standard' | 'deluxe' | 'vip'; // Loại phòng
    include_dental: boolean;      // Nha khoa
    include_maternity: boolean;   // Thai sản
    include_outpatient: boolean;  // Ngoại trú
    include_wellness: boolean;    // Chăm sóc sức khỏe
    geographic_coverage: 'vietnam' | 'asia' | 'worldwide';
  };

  // Duration
  coverage_duration: 12; // Always 12 months for health
}

export interface HealthQuoteResult {
  base_premium: number;
  discount: number;
  tax: number;
  total_premium: number;
  premium_per_person: number;
  premium_breakdown: HealthPremiumBreakdown;
  coverage_details: HealthCoverageDetail[];
  waiting_periods: WaitingPeriod[];
  valid_until: string;
  members_count: number;
}

export interface HealthPremiumBreakdown {
  base_by_age: number;
  gender_factor: number;
  occupation_loading: number;
  bmi_loading: number;
  smoker_loading: number;
  pre_existing_loading: number;
  family_discount: number;
  coverage_premium: number;
  dental_premium: number;
  maternity_premium: number;
  outpatient_premium: number;
  wellness_premium: number;
  geographic_factor: number;
  subtotal: number;
  discount_amount: number;
  vat: number;
  total: number;
}

export interface HealthCoverageDetail {
  name: string;
  description: string;
  annual_limit: number;
  per_visit_limit?: number;
  included: boolean;
  waiting_period_days?: number;
}

export interface WaitingPeriod {
  condition: string;
  days: number;
  description: string;
}

// Base annual rates by age group and plan (VND)
const BASE_RATES: Record<string, Record<string, number>> = {
  basic: {
    '0-17': 2500000,
    '18-30': 3500000,
    '31-40': 5000000,
    '41-50': 7500000,
    '51-60': 12000000,
    '61-65': 18000000,
    '66+': 25000000,
  },
  standard: {
    '0-17': 5000000,
    '18-30': 7000000,
    '31-40': 10000000,
    '41-50': 15000000,
    '51-60': 22000000,
    '61-65': 32000000,
    '66+': 45000000,
  },
  premium: {
    '0-17': 10000000,
    '18-30': 14000000,
    '31-40': 20000000,
    '41-50': 30000000,
    '51-60': 42000000,
    '61-65': 55000000,
    '66+': 75000000,
  },
  platinum: {
    '0-17': 20000000,
    '18-30': 28000000,
    '31-40': 38000000,
    '41-50': 55000000,
    '51-60': 75000000,
    '61-65': 100000000,
    '66+': 140000000,
  },
};

// Coverage limits by plan (VND)
const PLAN_LIMITS: Record<string, Record<string, number>> = {
  basic: {
    annual_limit: 500000000,
    per_hospitalization: 200000000,
    surgery: 100000000,
    icu: 5000000, // per day
    room: 2000000, // per day
    outpatient: 50000000,
    dental: 5000000,
    maternity: 30000000,
  },
  standard: {
    annual_limit: 1500000000,
    per_hospitalization: 500000000,
    surgery: 300000000,
    icu: 10000000,
    room: 4000000,
    outpatient: 100000000,
    dental: 10000000,
    maternity: 60000000,
  },
  premium: {
    annual_limit: 5000000000,
    per_hospitalization: 1000000000,
    surgery: 500000000,
    icu: 20000000,
    room: 8000000,
    outpatient: 200000000,
    dental: 20000000,
    maternity: 100000000,
  },
  platinum: {
    annual_limit: 10000000000,
    per_hospitalization: 3000000000,
    surgery: 1000000000,
    icu: 50000000,
    room: 15000000,
    outpatient: 500000000,
    dental: 50000000,
    maternity: 200000000,
  },
};

// High-risk occupations
const HIGH_RISK_OCCUPATIONS = [
  'lái xe', 'xây dựng', 'khai thác mỏ', 'cứu hỏa', 'quân đội', 'cảnh sát',
  'thợ điện', 'thợ hàn', 'ngư dân', 'phi công',
];

export class HealthQuoteEngineService {
  static calculateHealthQuote(input: HealthQuoteInput): HealthQuoteResult {
    const allMembers = [
      { ...input.applicant, relationship: 'self' as const },
      ...(input.family_members || []),
    ];

    let totalPremium = 0;
    let baseByAge = 0;
    let genderFactor = 0;
    let occupationLoading = 0;
    let bmiLoading = 0;
    let smokerLoading = 0;
    let preExistingLoading = 0;

    // Calculate premium for each member
    for (const member of allMembers) {
      const age = this.calculateAge(member.date_of_birth);
      const ageGroup = this.getAgeGroup(age);
      const baseRate = BASE_RATES[input.plan_type]?.[ageGroup] || BASE_RATES['standard']['31-40'];

      let memberPremium = baseRate;
      baseByAge += baseRate;

      // Gender factor
      const gFactor = member.gender === 'female' ? 1.05 : 1.0; // Slightly higher for female (maternity risk)
      memberPremium *= gFactor;
      genderFactor += (gFactor - 1.0) * baseRate;

      totalPremium += memberPremium;
    }

    // Occupation loading (primary applicant)
    const occLower = input.applicant.occupation.toLowerCase();
    if (HIGH_RISK_OCCUPATIONS.some(o => occLower.includes(o))) {
      occupationLoading = totalPremium * 0.15;
      totalPremium += occupationLoading;
    }

    // BMI loading
    const bmi = this.calculateBMI(input.health_declaration.height_cm, input.health_declaration.weight_kg);
    if (bmi > 35) {
      bmiLoading = totalPremium * 0.2;
      totalPremium += bmiLoading;
    } else if (bmi > 30) {
      bmiLoading = totalPremium * 0.1;
      totalPremium += bmiLoading;
    } else if (bmi < 16) {
      bmiLoading = totalPremium * 0.05;
      totalPremium += bmiLoading;
    }

    // Smoker loading
    if (input.health_declaration.is_smoker) {
      smokerLoading = totalPremium * 0.25;
      totalPremium += smokerLoading;
    }

    // Pre-existing conditions loading
    if (input.health_declaration.has_pre_existing_conditions) {
      const condCount = input.health_declaration.pre_existing_conditions?.length || 1;
      const loading = Math.min(condCount * 0.1, 0.5); // Up to 50% max
      preExistingLoading = totalPremium * loading;
      totalPremium += preExistingLoading;
    }

    // Additional coverage premiums
    let dentalPremium = 0;
    let maternityPremium = 0;
    let outpatientPremium = 0;
    let wellnessPremium = 0;

    if (input.coverage_options.include_dental) {
      dentalPremium = allMembers.length * 1500000;
      totalPremium += dentalPremium;
    }
    if (input.coverage_options.include_maternity) {
      maternityPremium = 8000000;
      totalPremium += maternityPremium;
    }
    if (input.coverage_options.include_outpatient && input.coverage_type === 'inpatient') {
      outpatientPremium = totalPremium * 0.4;
      totalPremium += outpatientPremium;
    }
    if (input.coverage_options.include_wellness) {
      wellnessPremium = allMembers.length * 1000000;
      totalPremium += wellnessPremium;
    }

    // Geographic factor
    let geographicFactor = 1.0;
    if (input.coverage_options.geographic_coverage === 'asia') geographicFactor = 1.3;
    else if (input.coverage_options.geographic_coverage === 'worldwide') geographicFactor = 1.8;
    const geographicLoading = totalPremium * (geographicFactor - 1.0);
    totalPremium *= geographicFactor;

    // Family discount
    let familyDiscount = 0;
    if (input.is_family_plan && allMembers.length >= 3) {
      familyDiscount = totalPremium * 0.1;
    } else if (input.is_family_plan && allMembers.length >= 2) {
      familyDiscount = totalPremium * 0.05;
    }

    const subtotal = Math.round(totalPremium);
    const discountAmount = Math.round(familyDiscount);
    const afterDiscount = subtotal - discountAmount;
    const vat = Math.round(afterDiscount * 0.1);
    const total = afterDiscount + vat;

    // Coverage details
    const limits = PLAN_LIMITS[input.plan_type] || PLAN_LIMITS['standard'];
    const coverageDetails: HealthCoverageDetail[] = [
      { name: 'Nội trú & Phẫu thuật', description: 'Chi phí nằm viện, phẫu thuật', annual_limit: limits.annual_limit, included: true },
      { name: 'Phòng bệnh', description: `Phòng ${input.coverage_options.room_type}`, annual_limit: limits.room, per_visit_limit: limits.room, included: true },
      { name: 'Phẫu thuật', description: 'Chi phí phẫu thuật và thủ thuật', annual_limit: limits.surgery, included: true },
      { name: 'ICU', description: 'Phòng chăm sóc đặc biệt', annual_limit: limits.icu, per_visit_limit: limits.icu, included: true },
      { name: 'Ngoại trú', description: 'Khám bệnh, xét nghiệm ngoại trú', annual_limit: limits.outpatient, included: input.coverage_options.include_outpatient || input.coverage_type !== 'inpatient', waiting_period_days: 30 },
      { name: 'Nha khoa', description: 'Khám và điều trị nha khoa', annual_limit: limits.dental, included: input.coverage_options.include_dental, waiting_period_days: 180 },
      { name: 'Thai sản', description: 'Chi phí sinh đẻ và chăm sóc trước/sau sinh', annual_limit: limits.maternity, included: input.coverage_options.include_maternity, waiting_period_days: 270 },
      { name: 'Chăm sóc sức khỏe', description: 'Khám tổng quát định kỳ', annual_limit: allMembers.length * 3000000, included: input.coverage_options.include_wellness, waiting_period_days: 0 },
    ];

    // Waiting periods
    const waitingPeriods: WaitingPeriod[] = [
      { condition: 'Bệnh thông thường', days: 30, description: '30 ngày kể từ ngày hiệu lực' },
      { condition: 'Bệnh đặc biệt / Có sẵn', days: 365, description: '12 tháng cho bệnh lý nền' },
      { condition: 'Thai sản', days: 270, description: '9 tháng chờ cho quyền lợi thai sản' },
      { condition: 'Nha khoa', days: 180, description: '6 tháng chờ cho nha khoa' },
    ];

    const premiumBreakdown: HealthPremiumBreakdown = {
      base_by_age: Math.round(baseByAge),
      gender_factor: Math.round(genderFactor),
      occupation_loading: Math.round(occupationLoading),
      bmi_loading: Math.round(bmiLoading),
      smoker_loading: Math.round(smokerLoading),
      pre_existing_loading: Math.round(preExistingLoading),
      family_discount: discountAmount,
      coverage_premium: Math.round(baseByAge),
      dental_premium: dentalPremium,
      maternity_premium: maternityPremium,
      outpatient_premium: Math.round(outpatientPremium),
      wellness_premium: wellnessPremium,
      geographic_factor: Math.round(geographicLoading),
      subtotal,
      discount_amount: discountAmount,
      vat,
      total,
    };

    return {
      base_premium: subtotal,
      discount: discountAmount,
      tax: vat,
      total_premium: total,
      premium_per_person: Math.round(total / allMembers.length),
      premium_breakdown: premiumBreakdown,
      coverage_details: coverageDetails,
      waiting_periods: waitingPeriods,
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      members_count: allMembers.length,
    };
  }

  private static calculateAge(dob: string): number {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  private static getAgeGroup(age: number): string {
    if (age <= 17) return '0-17';
    if (age <= 30) return '18-30';
    if (age <= 40) return '31-40';
    if (age <= 50) return '41-50';
    if (age <= 60) return '51-60';
    if (age <= 65) return '61-65';
    return '66+';
  }

  private static calculateBMI(heightCm: number, weightKg: number): number {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }
}
