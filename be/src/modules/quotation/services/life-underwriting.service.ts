import { logger } from '../../../shared/utils/logger';

export interface LifeUnderwritingInput {
  // Personal
  age: number;
  gender: 'male' | 'female';
  smoking_status: 'non_smoker' | 'smoker' | 'ex_smoker';
  occupation: string;
  occupation_class: number;
  annual_income?: number;

  // Physical
  height_cm: number;
  weight_kg: number;
  bmi: number;

  // Health declaration
  health_conditions: string[];
  family_medical_history: string[];
  current_medications?: string[];

  // Lifestyle
  alcohol_consumption?: 'none' | 'moderate' | 'heavy';
  exercise_frequency?: 'none' | 'occasional' | 'regular';
  hazardous_activities?: string[];

  // Coverage
  sum_assured: number;
  existing_coverage?: number;
  income_multiple?: number;
}

export interface LifeUnderwritingResult {
  decision: 'auto_approved' | 'approved_with_loading' | 'refer_to_underwriter' | 'declined';
  risk_class: 'preferred' | 'standard' | 'substandard_1' | 'substandard_2' | 'substandard_3' | 'decline';
  risk_score: number;
  premium_loading: number; // percentage
  exclusions: string[];
  conditions: string[];
  reasons: string[];
  recommendations: string[];
  requires_medical_exam: boolean;
  required_documents: string[];
}

// High-risk health conditions
const HIGH_RISK_CONDITIONS = [
  'cancer', 'heart_disease', 'stroke', 'diabetes_type1', 'kidney_failure',
  'liver_cirrhosis', 'hiv', 'hepatitis_b', 'hepatitis_c',
];

const MODERATE_RISK_CONDITIONS = [
  'diabetes_type2', 'hypertension', 'asthma', 'thyroid_disorder',
  'anxiety', 'depression', 'back_pain', 'arthritis', 'obesity',
];

const HAZARDOUS_OCCUPATIONS = [
  'mining', 'construction_height', 'explosives', 'deep_sea_diving',
  'military_combat', 'aviation_pilot', 'offshore_drilling',
];

export class LifeUnderwritingEngine {
  /**
   * Evaluate life insurance application
   */
  static evaluate(input: LifeUnderwritingInput): LifeUnderwritingResult {
    const factors: { category: string; score: number; reason: string }[] = [];
    const exclusions: string[] = [];
    const conditions: string[] = [];
    const reasons: string[] = [];
    const recommendations: string[] = [];
    const requiredDocs: string[] = ['CCCD/CMND', 'Đơn yêu cầu BH'];

    // 1. Age assessment
    const ageScore = this.assessAge(input.age);
    factors.push({ category: 'age', score: ageScore, reason: `Tuổi: ${input.age}` });

    // 2. BMI assessment
    const bmiScore = this.assessBMI(input.bmi);
    factors.push({ category: 'bmi', score: bmiScore, reason: `BMI: ${input.bmi.toFixed(1)}` });
    if (input.bmi > 35) {
      conditions.push('Yêu cầu giấy xác nhận sức khỏe từ bác sĩ');
      requiredDocs.push('Kết quả xét nghiệm máu');
    }

    // 3. Smoking assessment
    const smokingScore = this.assessSmoking(input.smoking_status);
    factors.push({ category: 'smoking', score: smokingScore, reason: `Hút thuốc: ${input.smoking_status}` });
    if (input.smoking_status === 'smoker') {
      reasons.push('Phí bảo hiểm tăng do hút thuốc');
    }

    // 4. Occupation assessment
    const occupationScore = this.assessOccupation(input.occupation_class, input.occupation);
    factors.push({ category: 'occupation', score: occupationScore, reason: `Nghề nghiệp class ${input.occupation_class}` });
    if (input.occupation_class >= 4) {
      exclusions.push('Không bảo hiểm tai nạn lao động liên quan nghề nghiệp');
    }

    // 5. Health conditions
    const healthScore = this.assessHealthConditions(input.health_conditions);
    factors.push({ category: 'health', score: healthScore, reason: `${input.health_conditions.length} bệnh lý khai báo` });

    for (const condition of input.health_conditions) {
      if (HIGH_RISK_CONDITIONS.includes(condition)) {
        reasons.push(`Bệnh lý nghiêm trọng: ${condition}`);
        requiredDocs.push('Hồ sơ bệnh án chi tiết');
        requiredDocs.push('Kết quả xét nghiệm gần nhất');
      }
    }

    // 6. Family history
    const familyScore = this.assessFamilyHistory(input.family_medical_history);
    factors.push({ category: 'family', score: familyScore, reason: `${input.family_medical_history.length} tiền sử gia đình` });

    // 7. Financial underwriting (income vs coverage)
    const financialScore = this.assessFinancial(input.sum_assured, input.annual_income, input.existing_coverage);
    factors.push({ category: 'financial', score: financialScore, reason: 'Đánh giá tài chính' });
    if (financialScore > 3) {
      reasons.push('Mức bảo hiểm vượt thu nhập cho phép');
    }

    // 8. Lifestyle
    if (input.alcohol_consumption === 'heavy') {
      factors.push({ category: 'lifestyle', score: 3, reason: 'Sử dụng rượu bia nhiều' });
    }
    if (input.hazardous_activities && input.hazardous_activities.length > 0) {
      factors.push({ category: 'lifestyle', score: 2, reason: `Hoạt động nguy hiểm: ${input.hazardous_activities.join(', ')}` });
      exclusions.push(`Không bảo hiểm tai nạn từ: ${input.hazardous_activities.join(', ')}`);
    }

    // Calculate total risk score
    const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
    const maxPossibleScore = factors.length * 5;
    const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

    // Determine decision
    const { decision, riskClass, premiumLoading } = this.makeDecision(normalizedScore, factors);

    // Medical exam requirements
    const requiresMedicalExam = input.sum_assured > 2000000000 || // > 2B VND
      input.age > 45 ||
      healthScore > 3 ||
      totalScore > 15;

    if (requiresMedicalExam) {
      requiredDocs.push('Kết quả khám sức khỏe tổng quát');
      if (input.age > 50) requiredDocs.push('Điện tâm đồ (ECG)');
      if (input.sum_assured > 5000000000) requiredDocs.push('Xét nghiệm HIV');
    }

    // Recommendations
    if (input.smoking_status === 'smoker') {
      recommendations.push('Bỏ thuốc lá sau 12 tháng có thể đánh giá lại mức phí');
    }
    if (input.bmi > 30) {
      recommendations.push('Giảm cân có thể cải thiện điều kiện bảo hiểm');
    }

    logger.info(`[LifeUW] Decision: ${decision}, Score: ${normalizedScore}, Class: ${riskClass}`);

    return {
      decision,
      risk_class: riskClass,
      risk_score: normalizedScore,
      premium_loading: premiumLoading,
      exclusions,
      conditions,
      reasons,
      recommendations,
      requires_medical_exam: requiresMedicalExam,
      required_documents: [...new Set(requiredDocs)],
    };
  }

  private static assessAge(age: number): number {
    if (age <= 30) return 0;
    if (age <= 40) return 1;
    if (age <= 50) return 2;
    if (age <= 55) return 3;
    if (age <= 60) return 4;
    return 5;
  }

  private static assessBMI(bmi: number): number {
    if (bmi >= 18.5 && bmi <= 25) return 0;
    if (bmi >= 17 && bmi <= 27) return 1;
    if (bmi >= 16 && bmi <= 30) return 2;
    if (bmi >= 15 && bmi <= 35) return 3;
    return 5;
  }

  private static assessSmoking(status: string): number {
    if (status === 'non_smoker') return 0;
    if (status === 'ex_smoker') return 1;
    return 4; // smoker
  }

  private static assessOccupation(occupationClass: number, occupation: string): number {
    if (HAZARDOUS_OCCUPATIONS.includes(occupation)) return 5;
    return Math.max(0, (occupationClass - 1) * 2);
  }

  private static assessHealthConditions(conditions: string[]): number {
    let score = 0;
    for (const condition of conditions) {
      if (HIGH_RISK_CONDITIONS.includes(condition)) score += 5;
      else if (MODERATE_RISK_CONDITIONS.includes(condition)) score += 2;
      else score += 1;
    }
    return Math.min(score, 10);
  }

  private static assessFamilyHistory(history: string[]): number {
    let score = 0;
    for (const item of history) {
      if (['cancer', 'heart_disease', 'stroke', 'diabetes'].some(h => item.includes(h))) {
        score += 2;
      } else {
        score += 1;
      }
    }
    return Math.min(score, 5);
  }

  private static assessFinancial(sumAssured: number, annualIncome?: number, existingCoverage?: number): number {
    if (!annualIncome) return 0;
    const totalCoverage = sumAssured + (existingCoverage || 0);
    const incomeMultiple = totalCoverage / annualIncome;

    if (incomeMultiple <= 10) return 0;
    if (incomeMultiple <= 15) return 1;
    if (incomeMultiple <= 20) return 2;
    if (incomeMultiple <= 25) return 3;
    return 5; // Over-insurance risk
  }

  private static makeDecision(score: number, factors: { category: string; score: number }[]) {
    // Check for automatic declines
    const healthFactor = factors.find(f => f.category === 'health');
    if (healthFactor && healthFactor.score >= 8) {
      return { decision: 'declined' as const, riskClass: 'decline' as const, premiumLoading: 0 };
    }

    if (score <= 15) {
      return { decision: 'auto_approved' as const, riskClass: 'preferred' as const, premiumLoading: 0 };
    }
    if (score <= 30) {
      return { decision: 'auto_approved' as const, riskClass: 'standard' as const, premiumLoading: 0 };
    }
    if (score <= 45) {
      return { decision: 'approved_with_loading' as const, riskClass: 'substandard_1' as const, premiumLoading: 25 };
    }
    if (score <= 60) {
      return { decision: 'approved_with_loading' as const, riskClass: 'substandard_2' as const, premiumLoading: 50 };
    }
    if (score <= 75) {
      return { decision: 'refer_to_underwriter' as const, riskClass: 'substandard_3' as const, premiumLoading: 75 };
    }
    return { decision: 'declined' as const, riskClass: 'decline' as const, premiumLoading: 0 };
  }
}
