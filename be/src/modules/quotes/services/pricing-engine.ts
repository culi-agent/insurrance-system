/**
 * Pricing Engine - Calculates insurance premiums based on product pricing rules
 * 
 * Algorithm:
 * 1. Calculate base premium = baseRate * sumInsured
 * 2. Apply rating factors (age, gender, occupation, etc.)
 * 3. Apply loadings (risk surcharges)
 * 4. Apply discounts
 * 5. Calculate tax
 * 6. Return total
 */

export interface PricingInput {
  productType: string;
  sumInsured: number;
  deductible: number;
  customerInfo: Record<string, any>;
  coverageOptions: Record<string, any>;
}

export interface PricingResult {
  basePremium: number;
  ratingFactorDetails: Array<{ name: string; multiplier: number }>;
  loadings: Array<{ name: string; amount: number }>;
  discounts: Array<{ name: string; amount: number }>;
  tax: number;
  totalPremiumAnnual: number;
  totalPremiumMonthly: number;
}

interface PricingRules {
  baseRate: number;
  ratingFactors: RatingFactor[];
  loadings: Loading[];
  discounts: Discount[];
  taxRate: number;
}

interface RatingFactor {
  factorName: string;
  factorType: 'multiplier' | 'fixed';
  ranges: Array<{ min: number; max: number; value: number }>;
}

interface Loading {
  name: string;
  condition: { field: string; operator: string; value: any };
  percentage: number;
}

interface Discount {
  name: string;
  condition: { field: string; operator: string; value: any };
  percentage: number;
}

export class PricingEngine {
  /**
   * Calculate premium for motor insurance
   */
  static calculateMotorPremium(input: {
    vehicleValue: number;
    engineCC: number;
    vehicleType: string;
    coverageType: string;
    year: number;
    deductible: number;
    addPassenger: boolean;
    passengerSeats: number;
  }): PricingResult {
    // Base rate varies by coverage type
    const baseRates: Record<string, number> = {
      liability_only: 0.0066,  // TNDS only: 0.66%
      comprehensive: 0.015,     // Toàn diện: 1.5%
    };

    const baseRate = baseRates[input.coverageType] || baseRates.comprehensive;
    let basePremium = input.vehicleValue * baseRate;

    const ratingFactorDetails: Array<{ name: string; multiplier: number }> = [];
    const loadings: Array<{ name: string; amount: number }> = [];
    const discounts: Array<{ name: string; amount: number }> = [];

    // Rating factor: Vehicle type
    const vehicleTypeMultipliers: Record<string, number> = {
      motorcycle: 0.8,
      car: 1.0,
      truck: 1.3,
      bus: 1.5,
    };
    const vtMultiplier = vehicleTypeMultipliers[input.vehicleType] || 1.0;
    basePremium *= vtMultiplier;
    ratingFactorDetails.push({ name: 'vehicle_type', multiplier: vtMultiplier });

    // Rating factor: Engine CC
    let ccMultiplier = 1.0;
    if (input.engineCC > 2000) ccMultiplier = 1.3;
    else if (input.engineCC > 1500) ccMultiplier = 1.15;
    else if (input.engineCC > 500) ccMultiplier = 1.0;
    else ccMultiplier = 0.85;
    basePremium *= ccMultiplier;
    ratingFactorDetails.push({ name: 'engine_cc', multiplier: ccMultiplier });

    // Rating factor: Vehicle age
    const vehicleAge = new Date().getFullYear() - input.year;
    let ageMultiplier = 1.0;
    if (vehicleAge > 10) ageMultiplier = 1.4;
    else if (vehicleAge > 5) ageMultiplier = 1.2;
    else if (vehicleAge > 3) ageMultiplier = 1.1;
    else ageMultiplier = 1.0;
    basePremium *= ageMultiplier;
    ratingFactorDetails.push({ name: 'vehicle_age', multiplier: ageMultiplier });

    // Loading: Passenger coverage
    if (input.addPassenger) {
      const passengerLoading = input.passengerSeats * 20000; // 20K per seat
      loadings.push({ name: 'passenger_coverage', amount: passengerLoading });
      basePremium += passengerLoading;
    }

    // Discount: High deductible
    if (input.deductible >= 1000000) {
      const discountAmount = basePremium * 0.1;
      discounts.push({ name: 'high_deductible', amount: discountAmount });
      basePremium -= discountAmount;
    } else if (input.deductible >= 500000) {
      const discountAmount = basePremium * 0.05;
      discounts.push({ name: 'deductible_discount', amount: discountAmount });
      basePremium -= discountAmount;
    }

    // Tax (VAT 10% for insurance)
    const taxRate = 0.1;
    const tax = Math.round(basePremium * taxRate);
    const totalPremiumAnnual = Math.round(basePremium + tax);
    const totalPremiumMonthly = Math.round(totalPremiumAnnual / 12);

    return {
      basePremium: Math.round(basePremium),
      ratingFactorDetails,
      loadings,
      discounts,
      tax,
      totalPremiumAnnual,
      totalPremiumMonthly,
    };
  }

  /**
   * Calculate premium for health insurance
   */
  static calculateHealthPremium(input: {
    dateOfBirth: string;
    gender: string;
    smoking: boolean;
    sumInsured: number;
    inpatient: boolean;
    outpatient: boolean;
    dental: boolean;
    maternity: boolean;
    criticalIllness: boolean;
    deductible: number;
    planType: string;
  }): PricingResult {
    // Base rate for health insurance: percentage of sum insured
    const baseRate = 0.025; // 2.5% of sum insured
    let basePremium = input.sumInsured * baseRate;

    const ratingFactorDetails: Array<{ name: string; multiplier: number }> = [];
    const loadings: Array<{ name: string; amount: number }> = [];
    const discounts: Array<{ name: string; amount: number }> = [];

    // Rating factor: Age
    const age = Math.floor(
      (Date.now() - new Date(input.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    let ageMultiplier = 1.0;
    if (age > 60) ageMultiplier = 2.5;
    else if (age > 50) ageMultiplier = 1.8;
    else if (age > 40) ageMultiplier = 1.4;
    else if (age > 30) ageMultiplier = 1.1;
    else if (age < 18) ageMultiplier = 0.7;
    basePremium *= ageMultiplier;
    ratingFactorDetails.push({ name: 'age', multiplier: ageMultiplier });

    // Rating factor: Gender
    const genderMultiplier = input.gender === 'female' ? 1.05 : 1.0;
    basePremium *= genderMultiplier;
    ratingFactorDetails.push({ name: 'gender', multiplier: genderMultiplier });

    // Loading: Smoking
    if (input.smoking) {
      const smokingLoading = basePremium * 0.3;
      loadings.push({ name: 'smoking_surcharge', amount: Math.round(smokingLoading) });
      basePremium += smokingLoading;
    }

    // Coverage add-ons
    if (input.outpatient) {
      const outpatientAdd = basePremium * 0.4;
      loadings.push({ name: 'outpatient_coverage', amount: Math.round(outpatientAdd) });
      basePremium += outpatientAdd;
    }
    if (input.dental) {
      const dentalAdd = basePremium * 0.15;
      loadings.push({ name: 'dental_coverage', amount: Math.round(dentalAdd) });
      basePremium += dentalAdd;
    }
    if (input.maternity) {
      const maternityAdd = basePremium * 0.25;
      loadings.push({ name: 'maternity_coverage', amount: Math.round(maternityAdd) });
      basePremium += maternityAdd;
    }
    if (input.criticalIllness) {
      const ciAdd = basePremium * 0.2;
      loadings.push({ name: 'critical_illness_rider', amount: Math.round(ciAdd) });
      basePremium += ciAdd;
    }

    // Discount: Family plan
    if (input.planType === 'family') {
      const familyDiscount = basePremium * 0.15;
      discounts.push({ name: 'family_plan_discount', amount: Math.round(familyDiscount) });
      basePremium -= familyDiscount;
    }

    // Discount: High deductible
    if (input.deductible >= 5000000) {
      const dedDiscount = basePremium * 0.15;
      discounts.push({ name: 'high_deductible', amount: Math.round(dedDiscount) });
      basePremium -= dedDiscount;
    } else if (input.deductible >= 2000000) {
      const dedDiscount = basePremium * 0.08;
      discounts.push({ name: 'deductible_discount', amount: Math.round(dedDiscount) });
      basePremium -= dedDiscount;
    }

    const taxRate = 0.1;
    const tax = Math.round(basePremium * taxRate);
    const totalPremiumAnnual = Math.round(basePremium + tax);
    const totalPremiumMonthly = Math.round(totalPremiumAnnual / 12);

    return {
      basePremium: Math.round(basePremium),
      ratingFactorDetails,
      loadings,
      discounts,
      tax,
      totalPremiumAnnual,
      totalPremiumMonthly,
    };
  }

  /**
   * Calculate premium for travel insurance
   */
  static calculateTravelPremium(input: {
    tripType: string; // domestic, international
    destination: string;
    departureDate: string;
    returnDate: string;
    travelers: Array<{ age: number }>;
    coveragePlan: string; // basic, standard, premium
    activities: string[];
  }): PricingResult {
    // Calculate trip duration
    const departure = new Date(input.departureDate);
    const returnDate = new Date(input.returnDate);
    const tripDays = Math.ceil((returnDate.getTime() - departure.getTime()) / (24 * 60 * 60 * 1000));

    // Base rates per day per person
    const planRates: Record<string, number> = {
      basic: 25000,
      standard: 50000,
      premium: 100000,
    };

    const baseRatePerDay = planRates[input.coveragePlan] || planRates.standard;
    let basePremium = baseRatePerDay * tripDays * input.travelers.length;

    const ratingFactorDetails: Array<{ name: string; multiplier: number }> = [];
    const loadings: Array<{ name: string; amount: number }> = [];
    const discounts: Array<{ name: string; amount: number }> = [];

    // Rating factor: Trip type
    const tripMultiplier = input.tripType === 'international' ? 2.0 : 1.0;
    basePremium *= tripMultiplier;
    ratingFactorDetails.push({ name: 'trip_type', multiplier: tripMultiplier });

    // Rating factor: Average traveler age
    const avgAge = input.travelers.reduce((sum, t) => sum + t.age, 0) / input.travelers.length;
    let ageMultiplier = 1.0;
    if (avgAge > 65) ageMultiplier = 2.0;
    else if (avgAge > 50) ageMultiplier = 1.5;
    else if (avgAge < 18) ageMultiplier = 0.8;
    basePremium *= ageMultiplier;
    ratingFactorDetails.push({ name: 'age_group', multiplier: ageMultiplier });

    // Loading: High-risk activities
    const highRiskActivities = ['skiing', 'diving', 'bungee_jumping', 'mountaineering'];
    const riskyActivities = input.activities.filter((a) => highRiskActivities.includes(a));
    if (riskyActivities.length > 0) {
      const activityLoading = basePremium * 0.3 * riskyActivities.length;
      loadings.push({ name: 'high_risk_activities', amount: Math.round(activityLoading) });
      basePremium += activityLoading;
    }

    // Discount: Group (3+ travelers)
    if (input.travelers.length >= 3) {
      const groupDiscount = basePremium * 0.1;
      discounts.push({ name: 'group_discount', amount: Math.round(groupDiscount) });
      basePremium -= groupDiscount;
    }

    const taxRate = 0.1;
    const tax = Math.round(basePremium * taxRate);
    const totalPremiumAnnual = Math.round(basePremium + tax);
    const totalPremiumMonthly = Math.round(totalPremiumAnnual / 12);

    // Sum insured varies by plan
    const sumInsuredByPlan: Record<string, number> = {
      basic: 500000000,      // 500M
      standard: 1000000000,  // 1B
      premium: 2000000000,   // 2B
    };

    return {
      basePremium: Math.round(basePremium),
      ratingFactorDetails,
      loadings,
      discounts,
      tax,
      totalPremiumAnnual,
      totalPremiumMonthly,
    };
  }
}
