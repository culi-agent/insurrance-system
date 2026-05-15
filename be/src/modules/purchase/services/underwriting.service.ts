/**
 * Auto-Underwriting Engine (Rule-Based)
 * Evaluates insurance applications and makes automated decisions
 */

export interface UnderwritingInput {
  insurance_type: string;
  applicant: {
    age: number;
    gender: string;
    occupation?: string;
    id_number: string;
    address?: string;
  };
  coverage: {
    type: string;
    sum_insured: number;
    duration_months: number;
    additional_coverage?: string[];
  };
  // Motor-specific
  vehicle?: {
    type: string;
    brand: string;
    model: string;
    year: number;
    value: number;
    usage: string;
  };
  // Health-specific
  health_declaration?: {
    has_pre_existing: boolean;
    conditions?: string[];
    is_smoker?: boolean;
    bmi?: number;
  };
  // Previous claims
  claims_history?: {
    total_claims: number;
    last_claim_date?: string;
    total_claim_amount?: number;
  };
}

export interface UnderwritingResult {
  decision: 'auto_approved' | 'referred' | 'declined';
  risk_score: number; // 0-100 (0=low risk, 100=high risk)
  risk_level: 'low' | 'medium' | 'high' | 'very_high';
  reasons: string[];
  conditions?: string[];
  premium_adjustment?: number; // percentage (e.g., +10 means 10% increase)
  referral_reasons?: string[];
  evaluated_at: string;
}

export class UnderwritingService {
  // Risk thresholds
  private static readonly AUTO_APPROVE_THRESHOLD = 40;
  private static readonly REFERRAL_THRESHOLD = 70;

  /**
   * Evaluate an insurance application
   */
  static evaluate(input: UnderwritingInput): UnderwritingResult {
    let riskScore = 0;
    const reasons: string[] = [];
    const conditions: string[] = [];
    const referralReasons: string[] = [];
    let premiumAdjustment = 0;

    // Common rules
    riskScore += this.evaluateAge(input.applicant.age, input.insurance_type, reasons);
    riskScore += this.evaluateClaimsHistory(input.claims_history, reasons);
    riskScore += this.evaluateSumInsured(input.coverage.sum_insured, input.insurance_type, reasons);

    // Type-specific rules
    switch (input.insurance_type) {
      case 'motor':
        const motorResult = this.evaluateMotor(input, reasons, conditions);
        riskScore += motorResult.score;
        premiumAdjustment += motorResult.adjustment;
        break;
      case 'health':
        const healthResult = this.evaluateHealth(input, reasons, referralReasons);
        riskScore += healthResult.score;
        premiumAdjustment += healthResult.adjustment;
        break;
      case 'travel':
        const travelResult = this.evaluateTravel(input, reasons);
        riskScore += travelResult.score;
        premiumAdjustment += travelResult.adjustment;
        break;
    }

    // Cap risk score at 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine decision
    let decision: UnderwritingResult['decision'];
    if (riskScore <= this.AUTO_APPROVE_THRESHOLD) {
      decision = 'auto_approved';
      reasons.push('Hồ sơ đáp ứng tiêu chí duyệt tự động');
    } else if (riskScore <= this.REFERRAL_THRESHOLD) {
      decision = 'referred';
      referralReasons.push('Rủi ro trung bình - cần xem xét thủ công');
    } else {
      decision = 'declined';
      reasons.push('Rủi ro vượt mức chấp nhận');
    }

    // Determine risk level
    let riskLevel: UnderwritingResult['risk_level'];
    if (riskScore <= 25) riskLevel = 'low';
    else if (riskScore <= 50) riskLevel = 'medium';
    else if (riskScore <= 75) riskLevel = 'high';
    else riskLevel = 'very_high';

    return {
      decision,
      risk_score: riskScore,
      risk_level: riskLevel,
      reasons,
      conditions: conditions.length > 0 ? conditions : undefined,
      premium_adjustment: premiumAdjustment !== 0 ? premiumAdjustment : undefined,
      referral_reasons: referralReasons.length > 0 ? referralReasons : undefined,
      evaluated_at: new Date().toISOString(),
    };
  }

  private static evaluateAge(age: number, insuranceType: string, reasons: string[]): number {
    let score = 0;
    if (age < 18) {
      score += 30;
      reasons.push('Chưa đủ tuổi pháp lý');
    } else if (age > 65 && insuranceType === 'health') {
      score += 20;
      reasons.push('Tuổi cao - rủi ro sức khỏe tăng');
    } else if (age < 25 && insuranceType === 'motor') {
      score += 10;
      reasons.push('Tài xế trẻ - rủi ro tai nạn cao hơn');
    }
    return score;
  }

  private static evaluateClaimsHistory(
    history: UnderwritingInput['claims_history'],
    reasons: string[]
  ): number {
    if (!history) return 0;

    let score = 0;
    if (history.total_claims > 3) {
      score += 25;
      reasons.push('Lịch sử bồi thường cao');
    } else if (history.total_claims > 1) {
      score += 10;
      reasons.push('Có lịch sử bồi thường');
    }

    if (history.total_claim_amount && history.total_claim_amount > 100000000) {
      score += 15;
      reasons.push('Tổng giá trị bồi thường lớn');
    }

    return score;
  }

  private static evaluateSumInsured(
    sumInsured: number,
    insuranceType: string,
    reasons: string[]
  ): number {
    let score = 0;
    const highValueThresholds: Record<string, number> = {
      motor: 2000000000,    // 2 billion VND
      health: 5000000000,   // 5 billion VND
      travel: 500000000,    // 500 million VND
    };

    const threshold = highValueThresholds[insuranceType] || 1000000000;
    if (sumInsured > threshold) {
      score += 15;
      reasons.push('Giá trị bảo hiểm cao');
    }

    return score;
  }

  private static evaluateMotor(
    input: UnderwritingInput,
    reasons: string[],
    conditions: string[]
  ): { score: number; adjustment: number } {
    let score = 0;
    let adjustment = 0;

    if (!input.vehicle) return { score: 0, adjustment: 0 };

    const vehicle = input.vehicle;
    const vehicleAge = new Date().getFullYear() - vehicle.year;

    // Old vehicle
    if (vehicleAge > 15) {
      score += 15;
      adjustment += 10;
      reasons.push('Xe quá cũ (> 15 năm)');
      conditions.push('Giám định xe trước khi cấp đơn');
    } else if (vehicleAge > 10) {
      score += 5;
      adjustment += 5;
      reasons.push('Xe cũ (> 10 năm)');
    }

    // High-value vehicle
    if (vehicle.value > 1500000000) {
      score += 10;
      reasons.push('Xe giá trị cao');
      conditions.push('Yêu cầu lắp thiết bị chống trộm');
    }

    // Commercial usage
    if (vehicle.usage === 'commercial') {
      score += 10;
      adjustment += 15;
      reasons.push('Xe sử dụng thương mại');
    }

    return { score, adjustment };
  }

  private static evaluateHealth(
    input: UnderwritingInput,
    reasons: string[],
    referralReasons: string[]
  ): { score: number; adjustment: number } {
    let score = 0;
    let adjustment = 0;

    if (!input.health_declaration) return { score: 0, adjustment: 0 };

    const health = input.health_declaration;

    // Pre-existing conditions
    if (health.has_pre_existing) {
      score += 25;
      adjustment += 20;
      reasons.push('Có bệnh lý nền');
      referralReasons.push('Cần đánh giá bệnh lý nền chi tiết');

      if (health.conditions && health.conditions.length > 2) {
        score += 15;
        referralReasons.push('Nhiều bệnh lý nền');
      }
    }

    // Smoker
    if (health.is_smoker) {
      score += 10;
      adjustment += 15;
      reasons.push('Người hút thuốc');
    }

    // BMI
    if (health.bmi) {
      if (health.bmi > 35) {
        score += 15;
        adjustment += 10;
        reasons.push('BMI rất cao (> 35)');
      } else if (health.bmi > 30) {
        score += 5;
        adjustment += 5;
        reasons.push('BMI cao (> 30)');
      }
    }

    return { score, adjustment };
  }

  private static evaluateTravel(
    input: UnderwritingInput,
    reasons: string[]
  ): { score: number; adjustment: number } {
    let score = 0;
    let adjustment = 0;

    // Travel is generally low risk for auto-approval
    if (input.applicant.age > 70) {
      score += 15;
      adjustment += 20;
      reasons.push('Tuổi cao - rủi ro du lịch tăng');
    }

    if (input.coverage.duration_months > 12) {
      score += 5;
      reasons.push('Thời hạn bảo hiểm dài');
    }

    return { score, adjustment };
  }
}
