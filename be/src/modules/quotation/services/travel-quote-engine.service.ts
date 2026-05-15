/**
 * Travel Insurance Quote Engine
 * Calculates premium for travel insurance based on trip details
 */

export interface TravelQuoteInput {
  // Trip information
  trip_type: 'single' | 'annual'; // Single trip vs Annual multi-trip
  destination_type: 'domestic' | 'asia' | 'worldwide'; // Nội địa, Châu Á, Toàn cầu
  destination_country?: string;
  departure_date: string;
  return_date: string;
  trip_purpose: 'leisure' | 'business' | 'study' | 'work';

  // Travelers
  travelers: Array<{
    full_name: string;
    date_of_birth: string;
    id_number?: string;
    is_primary: boolean;
  }>;

  // Coverage options
  plan_type: 'basic' | 'standard' | 'premium'; // Cơ bản, Tiêu chuẩn, Cao cấp
  coverage_options: {
    medical_expense: boolean;          // Chi phí y tế
    trip_cancellation: boolean;        // Hủy chuyến
    trip_delay: boolean;               // Trễ chuyến
    baggage_loss: boolean;             // Mất hành lý
    personal_accident: boolean;        // Tai nạn cá nhân
    personal_liability: boolean;       // Trách nhiệm dân sự
    emergency_evacuation: boolean;     // Di tản khẩn cấp
    flight_delay_compensation: boolean; // Bồi thường trễ chuyến bay
  };

  // Traveler info
  contact_name: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface TravelQuoteResult {
  base_premium: number;
  discount: number;
  tax: number;
  total_premium: number;
  premium_per_person: number;
  premium_breakdown: TravelPremiumBreakdown;
  coverage_details: TravelCoverageDetail[];
  valid_until: string;
  trip_duration_days: number;
}

export interface TravelPremiumBreakdown {
  base_rate: number;
  destination_factor: number;
  duration_factor: number;
  age_loading: number;
  group_discount: number;
  plan_premium: number;
  additional_coverage: number;
  subtotal: number;
  discount_amount: number;
  vat: number;
  total: number;
}

export interface TravelCoverageDetail {
  name: string;
  description: string;
  coverage_amount: number;
  included: boolean;
}

// Base daily rates by plan type (VND per person per day)
const BASE_DAILY_RATES: Record<string, Record<string, number>> = {
  basic: {
    domestic: 15000,
    asia: 35000,
    worldwide: 55000,
  },
  standard: {
    domestic: 30000,
    asia: 65000,
    worldwide: 100000,
  },
  premium: {
    domestic: 55000,
    asia: 120000,
    worldwide: 200000,
  },
};

// Coverage limits by plan (VND)
const COVERAGE_LIMITS: Record<string, Record<string, number>> = {
  basic: {
    medical_expense: 500000000,        // 500M
    trip_cancellation: 20000000,       // 20M
    trip_delay: 5000000,               // 5M
    baggage_loss: 15000000,            // 15M
    personal_accident: 200000000,      // 200M
    personal_liability: 100000000,     // 100M
    emergency_evacuation: 1000000000,  // 1B
    flight_delay_compensation: 3000000, // 3M
  },
  standard: {
    medical_expense: 1500000000,       // 1.5B
    trip_cancellation: 50000000,       // 50M
    trip_delay: 10000000,              // 10M
    baggage_loss: 30000000,            // 30M
    personal_accident: 500000000,      // 500M
    personal_liability: 300000000,     // 300M
    emergency_evacuation: 2000000000,  // 2B
    flight_delay_compensation: 5000000, // 5M
  },
  premium: {
    medical_expense: 5000000000,       // 5B
    trip_cancellation: 100000000,      // 100M
    trip_delay: 20000000,              // 20M
    baggage_loss: 50000000,            // 50M
    personal_accident: 1000000000,     // 1B
    personal_liability: 500000000,     // 500M
    emergency_evacuation: 5000000000,  // 5B
    flight_delay_compensation: 10000000, // 10M
  },
};

// Purpose factor
const PURPOSE_FACTORS: Record<string, number> = {
  leisure: 1.0,
  business: 1.1,
  study: 1.05,
  work: 1.2,
};

export class TravelQuoteEngineService {
  /**
   * Calculate travel insurance quote
   */
  static calculateTravelQuote(input: TravelQuoteInput): TravelQuoteResult {
    const tripDays = this.calculateTripDuration(input.departure_date, input.return_date);
    const numTravelers = input.travelers.length;

    // 1. Base rate
    const dailyRate = BASE_DAILY_RATES[input.plan_type]?.[input.destination_type] || 50000;
    const baseRate = dailyRate * tripDays;

    // 2. Destination factor
    const destinationFactor = input.destination_type === 'worldwide' ? 1.3 :
                              input.destination_type === 'asia' ? 1.0 : 0.7;

    // 3. Duration factor (longer trips get slight discount per day)
    let durationFactor = 1.0;
    if (tripDays > 30) durationFactor = 0.85;
    else if (tripDays > 14) durationFactor = 0.9;
    else if (tripDays > 7) durationFactor = 0.95;

    // 4. Age loading
    let ageLoading = 0;
    for (const traveler of input.travelers) {
      const age = this.calculateAge(traveler.date_of_birth);
      if (age > 70) ageLoading += baseRate * 0.5;
      else if (age > 60) ageLoading += baseRate * 0.3;
      else if (age > 50) ageLoading += baseRate * 0.1;
      else if (age < 18) ageLoading += baseRate * -0.1; // Children discount
    }

    // 5. Purpose factor
    const purposeFactor = PURPOSE_FACTORS[input.trip_purpose] || 1.0;

    // 6. Calculate plan premium per person
    const planPremiumPerPerson = Math.round(
      baseRate * destinationFactor * durationFactor * purposeFactor
    );

    // 7. Additional coverage
    let additionalCoverage = 0;
    if (input.coverage_options.trip_cancellation) additionalCoverage += planPremiumPerPerson * 0.15;
    if (input.coverage_options.flight_delay_compensation) additionalCoverage += planPremiumPerPerson * 0.05;

    // 8. Group discount
    let groupDiscount = 0;
    if (numTravelers >= 5) groupDiscount = 0.15;
    else if (numTravelers >= 3) groupDiscount = 0.1;
    else if (numTravelers >= 2) groupDiscount = 0.05;

    // 9. Calculate totals
    const subtotalPerPerson = planPremiumPerPerson + Math.round(additionalCoverage) + Math.round(ageLoading / numTravelers);
    const subtotal = subtotalPerPerson * numTravelers;
    const discountAmount = Math.round(subtotal * groupDiscount);
    const afterDiscount = subtotal - discountAmount;
    const vat = Math.round(afterDiscount * 0.1);
    const total = afterDiscount + vat;

    // Coverage details
    const limits = COVERAGE_LIMITS[input.plan_type] || COVERAGE_LIMITS['standard'];
    const coverageDetails: TravelCoverageDetail[] = [
      {
        name: 'Chi phí y tế & điều trị',
        description: 'Chi phí khám chữa bệnh, nằm viện tại nước ngoài',
        coverage_amount: limits.medical_expense,
        included: input.coverage_options.medical_expense,
      },
      {
        name: 'Hủy chuyến đi',
        description: 'Bồi thường khi phải hủy chuyến do nguyên nhân bất khả kháng',
        coverage_amount: limits.trip_cancellation,
        included: input.coverage_options.trip_cancellation,
      },
      {
        name: 'Trễ chuyến bay',
        description: 'Bồi thường chi phí phát sinh do trễ chuyến bay',
        coverage_amount: limits.trip_delay,
        included: input.coverage_options.trip_delay,
      },
      {
        name: 'Mất/hư hỏng hành lý',
        description: 'Bồi thường khi hành lý bị mất hoặc hư hỏng',
        coverage_amount: limits.baggage_loss,
        included: input.coverage_options.baggage_loss,
      },
      {
        name: 'Tai nạn cá nhân',
        description: 'Bồi thường tai nạn gây thương tật hoặc tử vong',
        coverage_amount: limits.personal_accident,
        included: input.coverage_options.personal_accident,
      },
      {
        name: 'Trách nhiệm dân sự',
        description: 'Bồi thường thiệt hại gây ra cho bên thứ ba',
        coverage_amount: limits.personal_liability,
        included: input.coverage_options.personal_liability,
      },
      {
        name: 'Di tản y tế khẩn cấp',
        description: 'Chi phí di tản y tế và hồi hương',
        coverage_amount: limits.emergency_evacuation,
        included: input.coverage_options.emergency_evacuation,
      },
      {
        name: 'Bồi thường trễ chuyến bay',
        description: 'Bồi thường tiền mặt khi chuyến bay trễ > 6 tiếng',
        coverage_amount: limits.flight_delay_compensation,
        included: input.coverage_options.flight_delay_compensation,
      },
    ];

    const premiumBreakdown: TravelPremiumBreakdown = {
      base_rate: baseRate,
      destination_factor: destinationFactor,
      duration_factor: durationFactor,
      age_loading: Math.round(ageLoading),
      group_discount: groupDiscount,
      plan_premium: planPremiumPerPerson * numTravelers,
      additional_coverage: Math.round(additionalCoverage) * numTravelers,
      subtotal,
      discount_amount: discountAmount,
      vat,
      total,
    };

    // Valid for 7 days
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return {
      base_premium: subtotal,
      discount: discountAmount,
      tax: vat,
      total_premium: total,
      premium_per_person: Math.round(total / numTravelers),
      premium_breakdown: premiumBreakdown,
      coverage_details: coverageDetails,
      valid_until: validUntil.toISOString(),
      trip_duration_days: tripDays,
    };
  }

  private static calculateTripDuration(departure: string, returnDate: string): number {
    const dep = new Date(departure);
    const ret = new Date(returnDate);
    const diffTime = Math.abs(ret.getTime() - dep.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  private static calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }
}
