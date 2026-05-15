import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export interface BusinessPropertyQuoteInput {
  enterprise_id: string;
  property_type: 'office' | 'warehouse' | 'factory' | 'retail' | 'mixed';
  property_value: number;
  location: { address: string; city: string; district: string };
  building_area: number; // sqm
  construction_type: 'concrete' | 'steel' | 'wood' | 'mixed';
  year_built: number;
  fire_protection: boolean;
  security_system: boolean;
  coverage_options: {
    fire: boolean;
    natural_disaster: boolean;
    theft: boolean;
    electrical_damage: boolean;
    water_damage: boolean;
    business_interruption: boolean;
    third_party_liability: boolean;
  };
  deductible_level: 'low' | 'medium' | 'high';
}

export interface LiabilityInsuranceQuoteInput {
  enterprise_id: string;
  liability_type: 'general' | 'professional' | 'product' | 'directors_officers' | 'cyber';
  business_description: string;
  annual_revenue: number;
  employee_count: number;
  coverage_limit: number;
  retroactive_date?: string;
  claims_history: { past_claims: number; total_amount: number };
}

export interface BusinessInterruptionQuoteInput {
  enterprise_id: string;
  monthly_revenue: number;
  monthly_expenses: number;
  indemnity_period: 3 | 6 | 12 | 18 | 24; // months
  waiting_period: 3 | 7 | 14 | 30; // days
  coverage_type: 'gross_profit' | 'revenue' | 'additional_expenses';
}

export class BusinessInsuranceService {
  /**
   * Get Business Property Insurance Quote
   */
  async getPropertyQuote(input: BusinessPropertyQuoteInput): Promise<any> {
    // Base rate calculation (per million VND of property value)
    let baseRate = 0.001; // 0.1% base rate

    // Property type factor
    const propertyFactors: Record<string, number> = {
      office: 0.8, warehouse: 1.2, factory: 1.5, retail: 1.0, mixed: 1.1,
    };
    baseRate *= propertyFactors[input.property_type] || 1.0;

    // Construction type factor
    const constructionFactors: Record<string, number> = {
      concrete: 0.7, steel: 0.8, wood: 1.5, mixed: 1.0,
    };
    baseRate *= constructionFactors[input.construction_type] || 1.0;

    // Building age factor
    const age = new Date().getFullYear() - input.year_built;
    if (age > 30) baseRate *= 1.4;
    else if (age > 20) baseRate *= 1.2;
    else if (age > 10) baseRate *= 1.1;

    // Discounts for safety features
    if (input.fire_protection) baseRate *= 0.85;
    if (input.security_system) baseRate *= 0.90;

    // Coverage options premium
    let coveragePremium = input.property_value * baseRate;
    const opts = input.coverage_options;
    if (opts.natural_disaster) coveragePremium *= 1.25;
    if (opts.theft) coveragePremium *= 1.15;
    if (opts.electrical_damage) coveragePremium *= 1.10;
    if (opts.water_damage) coveragePremium *= 1.10;
    if (opts.business_interruption) coveragePremium *= 1.30;
    if (opts.third_party_liability) coveragePremium *= 1.20;

    // Deductible adjustment
    const deductibleFactors: Record<string, number> = { low: 1.15, medium: 1.0, high: 0.80 };
    coveragePremium *= deductibleFactors[input.deductible_level] || 1.0;

    const annualPremium = Math.round(coveragePremium);
    const quoteId = uuidv4();

    await AppDataSource.query(
      `INSERT INTO business_insurance_quote (id, enterprise_id, quote_type, input_data, annual_premium, status, valid_until, created_at)
       VALUES ($1, $2, 'property', $3, $4, 'valid', NOW() + INTERVAL '30 days', NOW())`,
      [quoteId, input.enterprise_id, JSON.stringify(input), annualPremium]
    );

    logger.info(`[BusinessInsurance] Property quote: ${quoteId}, premium=${annualPremium}`);

    return {
      quote_id: quoteId,
      type: 'property',
      property_value: input.property_value,
      annual_premium: annualPremium,
      monthly_premium: Math.round(annualPremium / 12),
      coverage_summary: input.coverage_options,
      deductible_level: input.deductible_level,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Get Liability Insurance Quote
   */
  async getLiabilityQuote(input: LiabilityInsuranceQuoteInput): Promise<any> {
    // Base rates by liability type (as % of coverage limit)
    const baseRates: Record<string, number> = {
      general: 0.005, professional: 0.008, product: 0.007, directors_officers: 0.012, cyber: 0.015,
    };
    let rate = baseRates[input.liability_type] || 0.008;

    // Revenue-based adjustment
    if (input.annual_revenue > 100000000000) rate *= 1.3; // >100B VND
    else if (input.annual_revenue > 50000000000) rate *= 1.15;
    else if (input.annual_revenue < 5000000000) rate *= 0.85;

    // Employee count adjustment
    if (input.employee_count > 500) rate *= 1.2;
    else if (input.employee_count > 100) rate *= 1.1;

    // Claims history adjustment
    if (input.claims_history.past_claims > 3) rate *= 1.5;
    else if (input.claims_history.past_claims > 0) rate *= 1.2;

    const annualPremium = Math.round(input.coverage_limit * rate);
    const quoteId = uuidv4();

    await AppDataSource.query(
      `INSERT INTO business_insurance_quote (id, enterprise_id, quote_type, input_data, annual_premium, status, valid_until, created_at)
       VALUES ($1, $2, 'liability', $3, $4, 'valid', NOW() + INTERVAL '30 days', NOW())`,
      [quoteId, input.enterprise_id, JSON.stringify(input), annualPremium]
    );

    return {
      quote_id: quoteId,
      type: 'liability',
      liability_type: input.liability_type,
      coverage_limit: input.coverage_limit,
      annual_premium: annualPremium,
      monthly_premium: Math.round(annualPremium / 12),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Get Business Interruption Insurance Quote
   */
  async getInterruptionQuote(input: BusinessInterruptionQuoteInput): Promise<any> {
    const maxIndemnity = input.coverage_type === 'gross_profit'
      ? (input.monthly_revenue - input.monthly_expenses * 0.4) * input.indemnity_period
      : input.monthly_revenue * input.indemnity_period;

    // Base rate
    let rate = 0.015; // 1.5% of max indemnity

    // Waiting period discount
    const waitingFactors: Record<number, number> = { 3: 1.2, 7: 1.0, 14: 0.85, 30: 0.70 };
    rate *= waitingFactors[input.waiting_period] || 1.0;

    // Longer indemnity = higher rate
    if (input.indemnity_period >= 18) rate *= 1.3;
    else if (input.indemnity_period >= 12) rate *= 1.15;

    const annualPremium = Math.round(maxIndemnity * rate);
    const quoteId = uuidv4();

    await AppDataSource.query(
      `INSERT INTO business_insurance_quote (id, enterprise_id, quote_type, input_data, annual_premium, status, valid_until, created_at)
       VALUES ($1, $2, 'interruption', $3, $4, 'valid', NOW() + INTERVAL '30 days', NOW())`,
      [quoteId, input.enterprise_id, JSON.stringify(input), annualPremium]
    );

    return {
      quote_id: quoteId,
      type: 'business_interruption',
      max_indemnity: maxIndemnity,
      indemnity_period_months: input.indemnity_period,
      waiting_period_days: input.waiting_period,
      annual_premium: annualPremium,
      monthly_premium: Math.round(annualPremium / 12),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Purchase business insurance
   */
  async purchaseBusinessInsurance(enterpriseId: string, quoteId: string, additionalInfo: any): Promise<any> {
    const quote = await AppDataSource.query(
      `SELECT * FROM business_insurance_quote WHERE id = $1 AND enterprise_id = $2 AND status = 'valid'`,
      [quoteId, enterpriseId]
    );
    if (quote.length === 0) throw new NotFoundError('Báo giá không hợp lệ hoặc đã hết hạn');

    const q = quote[0];
    const policyId = uuidv4();
    const policyNumber = `BIZ-${q.quote_type.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

    await AppDataSource.query(
      `INSERT INTO policy (id, policy_number, enterprise_id, insurance_type, premium_amount, effective_date, expiry_date, status, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'active', $6, NOW(), NOW())`,
      [policyId, policyNumber, enterpriseId, `business_${q.quote_type}`, q.annual_premium, JSON.stringify({ quote_id: quoteId, quote_type: q.quote_type, input_data: q.input_data })]
    );

    await AppDataSource.query(
      `UPDATE business_insurance_quote SET status = 'purchased' WHERE id = $1`, [quoteId]
    );

    return { policy_id: policyId, policy_number: policyNumber, premium: q.annual_premium, status: 'active' };
  }
}
