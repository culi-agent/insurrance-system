import { logger } from '../../../shared/utils/logger';
import { ValidationError } from '../../../shared/errors/AppError';

/**
 * Life Insurance Quote Input
 */
export interface LifeInsuranceQuoteInput {
  // Personal info
  date_of_birth: string;
  gender: 'male' | 'female';
  smoking_status: 'non_smoker' | 'smoker' | 'ex_smoker';
  occupation: string;
  occupation_class: number; // 1-4 (1=office, 4=hazardous)
  annual_income?: number;

  // Health
  height_cm: number;
  weight_kg: number;
  health_conditions?: string[];
  family_medical_history?: string[];

  // Coverage
  sum_assured: number;
  policy_term: number; // years (10, 15, 20, 25, 30)
  premium_payment_term: number; // years (5, 10, 15, 20, same as policy_term)
  payment_frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

  // Riders
  riders?: Array<{
    code: string;
    sum_assured?: number;
  }>;
}

export interface LifeInsuranceQuoteResult {
  base_premium: number;
  rider_premiums: Array<{
    code: string;
    name: string;
    sum_assured: number;
    premium: number;
  }>;
  total_premium: number;
  payment_frequency: string;
  premium_per_payment: number;
  sum_assured: number;
  policy_term: number;
  premium_payment_term: number;
  risk_class: string;
  loading_percentage: number;
  illustration: BenefitIllustration;
}

export interface BenefitIllustration {
  guaranteed_benefits: Array<{
    year: number;
    age: number;
    annual_premium: number;
    cumulative_premium: number;
    death_benefit: number;
    surrender_value: number;
  }>;
  projected_benefits: {
    low: Array<{ year: number; maturity_value: number; total_benefit: number }>;
    mid: Array<{ year: number; maturity_value: number; total_benefit: number }>;
    high: Array<{ year: number; maturity_value: number; total_benefit: number }>;
  };
  summary: {
    total_premium_paid: number;
    death_benefit: number;
    maturity_benefit_low: number;
    maturity_benefit_mid: number;
    maturity_benefit_high: number;
  };
}

// Rider definitions
export const LIFE_RIDERS = [
  { code: 'CI', name: 'Bệnh hiểm nghèo (Critical Illness)', max_sa_ratio: 1.0, base_rate: 0.8 },
  { code: 'PA', name: 'Tai nạn cá nhân (Personal Accident)', max_sa_ratio: 2.0, base_rate: 0.3 },
  { code: 'WOP', name: 'Miễn đóng phí (Waiver of Premium)', max_sa_ratio: 0, base_rate: 0.5 },
  { code: 'HC', name: 'Nằm viện (Hospital Cash)', max_sa_ratio: 0.1, base_rate: 1.2 },
  { code: 'TPD', name: 'Thương tật toàn bộ vĩnh viễn', max_sa_ratio: 1.0, base_rate: 0.6 },
];

// Mortality table (simplified CSO table - per 1000)
const MORTALITY_RATES: Record<string, number[]> = {
  male: [
    0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, // 0-9
    0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, // 10-19
    1.6, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.8, 1.8, 1.9, // 20-29
    1.9, 2.0, 2.1, 2.2, 2.3, 2.5, 2.7, 2.9, 3.2, 3.5, // 30-39
    3.8, 4.2, 4.7, 5.2, 5.8, 6.5, 7.3, 8.2, 9.2, 10.3, // 40-49
    11.6, 13.0, 14.6, 16.4, 18.4, 20.7, 23.3, 26.2, 29.5, 33.2, // 50-59
    37.4, 42.2, 47.6, 53.7, 60.7, 68.7, 77.8, 88.2, 100.0, 113.5, // 60-69
  ],
  female: [
    0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, // 0-9
    0.4, 0.5, 0.5, 0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.7, // 10-19
    0.7, 0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.8, 0.9, 0.9, // 20-29
    1.0, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 2.0, // 30-39
    2.2, 2.5, 2.8, 3.1, 3.5, 3.9, 4.4, 5.0, 5.6, 6.3, // 40-49
    7.1, 8.0, 9.0, 10.2, 11.5, 13.0, 14.7, 16.7, 18.9, 21.5, // 50-59
    24.4, 27.8, 31.7, 36.2, 41.4, 47.5, 54.6, 62.8, 72.4, 83.5, // 60-69
    96.5, 111.6, 129.2, 149.8, 173.8, 201.6, 234.0, 271.7, 315.4, 366.0, // 70-79
  ],
};

export class LifeInsurancePricingEngine {
  /**
   * Calculate life insurance quote
   */
  static calculate(input: LifeInsuranceQuoteInput): LifeInsuranceQuoteResult {
    // Validate inputs
    this.validateInput(input);

    const age = this.calculateAge(input.date_of_birth);
    const bmi = input.weight_kg / Math.pow(input.height_cm / 100, 2);

    // Determine risk class
    const riskClass = this.determineRiskClass(input, age, bmi);
    const loadingPercentage = this.getLoadingPercentage(riskClass);

    // Calculate base premium
    const basePremium = this.calculateBasePremium(
      age, input.gender, input.sum_assured,
      input.policy_term, input.premium_payment_term, loadingPercentage
    );

    // Calculate rider premiums
    const riderPremiums = this.calculateRiderPremiums(input.riders || [], age, input.gender, input.sum_assured);

    const totalAnnualPremium = basePremium + riderPremiums.reduce((sum, r) => sum + r.premium, 0);
    const premiumPerPayment = this.calculatePerPayment(totalAnnualPremium, input.payment_frequency);

    // Generate benefit illustration
    const illustration = this.generateIllustration(
      age, input.sum_assured, basePremium, input.policy_term, input.premium_payment_term
    );

    return {
      base_premium: Math.round(basePremium),
      rider_premiums: riderPremiums,
      total_premium: Math.round(totalAnnualPremium),
      payment_frequency: input.payment_frequency,
      premium_per_payment: Math.round(premiumPerPayment),
      sum_assured: input.sum_assured,
      policy_term: input.policy_term,
      premium_payment_term: input.premium_payment_term,
      risk_class: riskClass,
      loading_percentage: loadingPercentage,
      illustration,
    };
  }

  private static validateInput(input: LifeInsuranceQuoteInput): void {
    const age = this.calculateAge(input.date_of_birth);
    if (age < 18 || age > 65) {
      throw new ValidationError('Tuổi tham gia phải từ 18-65');
    }
    if (input.sum_assured < 100000000) {
      throw new ValidationError('Số tiền bảo hiểm tối thiểu 100 triệu VND');
    }
    if (input.sum_assured > 50000000000) {
      throw new ValidationError('Số tiền bảo hiểm tối đa 50 tỷ VND');
    }
    if (![10, 15, 20, 25, 30].includes(input.policy_term)) {
      throw new ValidationError('Thời hạn hợp đồng phải là 10, 15, 20, 25 hoặc 30 năm');
    }
    if (input.premium_payment_term > input.policy_term) {
      throw new ValidationError('Thời hạn đóng phí không được vượt thời hạn hợp đồng');
    }
  }

  private static calculateBasePremium(
    age: number, gender: string, sumAssured: number,
    policyTerm: number, premiumPaymentTerm: number, loadingPct: number
  ): number {
    // Net premium calculation using mortality rates
    const mortalityRates = MORTALITY_RATES[gender] || MORTALITY_RATES.male;
    const interestRate = 0.04; // 4% technical interest rate

    // Calculate present value of benefits (PVFB)
    let pvfb = 0;
    for (let t = 1; t <= policyTerm; t++) {
      const ageAtT = age + t - 1;
      const qx = (mortalityRates[Math.min(ageAtT, mortalityRates.length - 1)] || 50) / 1000;
      const discountFactor = Math.pow(1 + interestRate, -t);
      pvfb += qx * discountFactor * sumAssured;
    }

    // Maturity benefit (endowment component)
    const maturityFactor = Math.pow(1 + interestRate, -policyTerm);
    const survivalProb = this.getSurvivalProbability(age, policyTerm, gender);
    pvfb += maturityFactor * sumAssured * 0.5 * survivalProb; // 50% of SA as maturity

    // Present value of future premiums (PVFP) annuity
    let pvfp = 0;
    for (let t = 0; t < premiumPaymentTerm; t++) {
      const discountFactor = Math.pow(1 + interestRate, -t);
      pvfp += discountFactor;
    }

    // Net premium
    const netPremium = pvfb / pvfp;

    // Gross premium (add expenses: 30% first year, 10% renewal + 5% profit margin)
    const expenseLoading = 0.15;
    const grossPremium = netPremium / (1 - expenseLoading);

    // Apply risk loading
    const finalPremium = grossPremium * (1 + loadingPct / 100);

    return finalPremium;
  }

  private static calculateRiderPremiums(
    riders: Array<{ code: string; sum_assured?: number }>,
    age: number, gender: string, mainSA: number
  ): Array<{ code: string; name: string; sum_assured: number; premium: number }> {
    return riders.map(rider => {
      const riderDef = LIFE_RIDERS.find(r => r.code === rider.code);
      if (!riderDef) return { code: rider.code, name: 'Unknown', sum_assured: 0, premium: 0 };

      let riderSA = rider.sum_assured || mainSA;
      if (riderDef.max_sa_ratio > 0) {
        riderSA = Math.min(riderSA, mainSA * riderDef.max_sa_ratio);
      }

      // Calculate rider premium
      const ageFactor = 1 + (age - 30) * 0.02; // 2% per year above 30
      const genderFactor = gender === 'male' ? 1.0 : 0.85;
      const premium = (riderSA / 1000) * riderDef.base_rate * ageFactor * genderFactor;

      return {
        code: rider.code,
        name: riderDef.name,
        sum_assured: riderSA,
        premium: Math.round(premium),
      };
    }).filter(r => r.premium > 0);
  }

  private static determineRiskClass(input: LifeInsuranceQuoteInput, age: number, bmi: number): string {
    let riskScore = 0;

    // Age factor
    if (age > 50) riskScore += 2;
    else if (age > 40) riskScore += 1;

    // BMI factor
    if (bmi < 18.5 || bmi > 35) riskScore += 2;
    else if (bmi < 20 || bmi > 30) riskScore += 1;

    // Smoking
    if (input.smoking_status === 'smoker') riskScore += 3;
    else if (input.smoking_status === 'ex_smoker') riskScore += 1;

    // Occupation class
    riskScore += Math.max(0, input.occupation_class - 1);

    // Health conditions
    if (input.health_conditions && input.health_conditions.length > 0) {
      riskScore += input.health_conditions.length;
    }

    // Family medical history
    if (input.family_medical_history && input.family_medical_history.length > 0) {
      riskScore += Math.ceil(input.family_medical_history.length * 0.5);
    }

    if (riskScore <= 1) return 'preferred';
    if (riskScore <= 3) return 'standard';
    if (riskScore <= 6) return 'substandard';
    return 'decline';
  }

  private static getLoadingPercentage(riskClass: string): number {
    switch (riskClass) {
      case 'preferred': return 0;
      case 'standard': return 0;
      case 'substandard': return 25;
      case 'decline': return 100; // Will be declined in underwriting
      default: return 0;
    }
  }

  private static calculatePerPayment(annualPremium: number, frequency: string): number {
    switch (frequency) {
      case 'monthly': return annualPremium / 12 * 1.05; // 5% modal factor
      case 'quarterly': return annualPremium / 4 * 1.03; // 3% modal factor
      case 'semi_annual': return annualPremium / 2 * 1.02; // 2% modal factor
      case 'annual': return annualPremium;
      default: return annualPremium;
    }
  }

  private static generateIllustration(
    age: number, sumAssured: number, annualPremium: number,
    policyTerm: number, premiumPaymentTerm: number
  ): BenefitIllustration {
    const guaranteedBenefits = [];
    let cumulativePremium = 0;

    for (let year = 1; year <= policyTerm; year++) {
      const premium = year <= premiumPaymentTerm ? annualPremium : 0;
      cumulativePremium += premium;

      // Surrender value (increases over time)
      const surrenderRatio = year <= 2 ? 0 : Math.min(0.9, (year - 2) / policyTerm * 1.2);
      const surrenderValue = Math.round(cumulativePremium * surrenderRatio);

      guaranteedBenefits.push({
        year,
        age: age + year,
        annual_premium: Math.round(premium),
        cumulative_premium: Math.round(cumulativePremium),
        death_benefit: sumAssured,
        surrender_value: surrenderValue,
      });
    }

    // Projected benefits (with different interest assumptions)
    const projectionRates = { low: 0.04, mid: 0.06, high: 0.08 };
    const projected: any = { low: [], mid: [], high: [] };

    for (const [scenario, rate] of Object.entries(projectionRates)) {
      let accountValue = 0;
      for (let year = 1; year <= policyTerm; year++) {
        const premium = year <= premiumPaymentTerm ? annualPremium : 0;
        accountValue = (accountValue + premium * 0.7) * (1 + rate); // 70% invested
        
        if (year % 5 === 0 || year === policyTerm) {
          projected[scenario].push({
            year,
            maturity_value: Math.round(accountValue),
            total_benefit: Math.round(accountValue + sumAssured * 0.5),
          });
        }
      }
    }

    const totalPremiumPaid = Math.round(annualPremium * premiumPaymentTerm);

    return {
      guaranteed_benefits: guaranteedBenefits,
      projected_benefits: projected,
      summary: {
        total_premium_paid: totalPremiumPaid,
        death_benefit: sumAssured,
        maturity_benefit_low: projected.low[projected.low.length - 1]?.maturity_value || 0,
        maturity_benefit_mid: projected.mid[projected.mid.length - 1]?.maturity_value || 0,
        maturity_benefit_high: projected.high[projected.high.length - 1]?.maturity_value || 0,
      },
    };
  }

  private static getSurvivalProbability(age: number, term: number, gender: string): number {
    const mortalityRates = MORTALITY_RATES[gender] || MORTALITY_RATES.male;
    let survival = 1;
    for (let t = 0; t < term; t++) {
      const qx = (mortalityRates[Math.min(age + t, mortalityRates.length - 1)] || 50) / 1000;
      survival *= (1 - qx);
    }
    return survival;
  }

  private static calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }
}
