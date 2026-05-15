import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Quotation } from '../entities/Quotation';
import { Product } from '../../products/entities/Product';
import { QuoteEngineService, MotorQuoteInput, QuoteResult } from './quote-engine.service';
import { TravelQuoteEngineService, TravelQuoteInput, TravelQuoteResult } from './travel-quote-engine.service';
import { HealthQuoteEngineService, HealthQuoteInput, HealthQuoteResult } from './health-quote-engine.service';
import { InsurerRegistry, QuoteRequest } from '../../insurer-integration';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class QuotationService {
  private quotationRepo: Repository<Quotation>;
  private productRepo: Repository<Product>;
  private insurerRegistry: InsurerRegistry;

  constructor() {
    this.quotationRepo = AppDataSource.getRepository(Quotation);
    this.productRepo = AppDataSource.getRepository(Product);
    this.insurerRegistry = InsurerRegistry.getInstance();
  }

  /**
   * Generate a motor insurance quote
   */
  async createMotorQuote(input: MotorQuoteInput, customerId?: string) {
    // Calculate quote using internal engine
    const quoteResult = QuoteEngineService.calculateMotorQuote(input);

    // Generate quote number
    const quoteNumber = this.generateQuoteNumber('MTR');

    // Find a matching product (optional - for linking)
    let productId: string | undefined;
    const product = await this.productRepo.findOne({
      where: { status: 'active' },
      order: { sortOrder: 'ASC' },
    });
    if (product) {
      productId = product.id;
    }

    // Save quotation
    const quotation = this.quotationRepo.create({
      quoteNumber,
      customerId,
      productId: productId || '00000000-0000-0000-0000-000000000000',
      insurerId: product?.insurerId || '00000000-0000-0000-0000-000000000000',
      insuranceType: 'motor',
      inputData: input as any,
      coverageOptions: {
        coverage_type: input.coverage_type,
        coverage_duration: input.coverage_duration,
        additional_coverage: input.additional_coverage,
      },
      premium: quoteResult.base_premium,
      basePremium: quoteResult.base_premium,
      discount: quoteResult.discount,
      tax: quoteResult.tax,
      totalPremium: quoteResult.total_premium,
      premiumBreakdown: quoteResult.premium_breakdown as any,
      status: 'quoted',
      validUntil: new Date(quoteResult.valid_until),
      metadata: {
        coverage_details: quoteResult.coverage_details,
      },
    });

    const saved = await this.quotationRepo.save(quotation);

    return {
      quote_id: saved.id,
      quote_number: saved.quoteNumber,
      insurance_type: 'motor',
      vehicle: {
        brand: input.vehicle_brand,
        model: input.vehicle_model,
        year: input.vehicle_year,
        license_plate: input.license_plate,
        value: input.vehicle_value,
      },
      premium: {
        base: quoteResult.base_premium,
        discount: quoteResult.discount,
        tax: quoteResult.tax,
        total: quoteResult.total_premium,
      },
      premium_breakdown: quoteResult.premium_breakdown,
      coverage_details: quoteResult.coverage_details,
      valid_until: quoteResult.valid_until,
      status: 'quoted',
    };
  }

  /**
   * Get quick motor quote without saving (for comparison)
   */
  async getQuickMotorQuote(input: MotorQuoteInput) {
    const quoteResult = QuoteEngineService.calculateMotorQuote(input);

    return {
      premium: {
        base: quoteResult.base_premium,
        discount: quoteResult.discount,
        tax: quoteResult.tax,
        total: quoteResult.total_premium,
      },
      premium_breakdown: quoteResult.premium_breakdown,
      coverage_details: quoteResult.coverage_details,
      valid_until: quoteResult.valid_until,
    };
  }

  /**
   * Get multi-insurer quotes for comparison using InsurerRegistry
   * Sprint 3: S3-06 - Real multi-insurer aggregation
   */
  async getMultiInsurerQuotes(input: MotorQuoteInput) {
    // Build the QuoteRequest for the adapter framework
    const quoteRequest: QuoteRequest = {
      insurance_type: 'motor',
      product_id: '',
      customer_info: {
        full_name: input.owner_name,
        id_number: input.owner_id_number,
      },
      coverage_options: {
        coverage_type: input.coverage_type,
        coverage_duration: input.coverage_duration,
        additional_coverage: input.additional_coverage,
      },
      input_data: {
        vehicle_type: input.vehicle_type,
        vehicle_brand: input.vehicle_brand,
        vehicle_model: input.vehicle_model,
        vehicle_year: input.vehicle_year,
        license_plate: input.license_plate,
        engine_capacity: input.engine_capacity,
        vehicle_value: input.vehicle_value,
        seats: input.seats,
        usage: input.usage,
        no_claims_years: input.no_claims_years || 0,
        has_garage: input.has_garage || false,
        has_dashcam: input.has_dashcam || false,
      },
    };

    // Call all insurer adapters via registry
    const { quotes, errors } = await this.insurerRegistry.getMultiInsurerQuotes(quoteRequest);

    // Format response for comparison view
    const formattedQuotes = quotes.map((q) => ({
      insurer: {
        code: q.insurer_code,
        name: q.insurer_name,
        rating: q.metadata?.rating || 4.0,
        features: q.metadata?.features || [],
      },
      product_name: q.product_name,
      premium: {
        base: q.base_premium,
        discount: q.discount,
        tax: q.tax,
        total: q.total_premium,
      },
      premium_breakdown: q.premium_breakdown,
      coverage_details: q.coverage_details,
      valid_until: q.valid_until,
      quote_ref: q.metadata?.quote_ref,
    }));

    return {
      quotes: formattedQuotes,
      total_quotes: formattedQuotes.length,
      errors: errors.length > 0 ? errors : undefined,
      vehicle: {
        type: input.vehicle_type,
        brand: input.vehicle_brand,
        model: input.vehicle_model,
        year: input.vehicle_year,
        value: input.vehicle_value,
      },
      coverage: {
        type: input.coverage_type,
        duration: input.coverage_duration,
        additional: input.additional_coverage,
      },
    };
  }

  /**
   * Get a saved quotation by ID
   */
  async getQuotationById(id: string, customerId?: string) {
    const where: any = { id };
    if (customerId) {
      where.customerId = customerId;
    }

    const quotation = await this.quotationRepo.findOne({
      where,
      relations: ['product'],
    });

    if (!quotation) {
      throw new NotFoundError('Báo giá không tìm thấy');
    }

    return this.formatQuotation(quotation);
  }

  /**
   * Get customer's quotation history
   */
  async getCustomerQuotations(customerId: string, page: number = 1, perPage: number = 10) {
    const [quotations, total] = await this.quotationRepo.findAndCount({
      where: { customerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      data: quotations.map(this.formatQuotation),
      total,
      page,
      per_page: perPage,
    };
  }

  /**
   * Accept a quote (mark as accepted, ready for purchase)
   */
  async acceptQuote(quoteId: string, customerId: string) {
    const quotation = await this.quotationRepo.findOne({
      where: { id: quoteId, customerId },
    });

    if (!quotation) {
      throw new NotFoundError('Báo giá không tìm thấy');
    }

    if (quotation.status !== 'quoted') {
      throw new ValidationError('Báo giá không ở trạng thái có thể chấp nhận');
    }

    if (new Date() > quotation.validUntil) {
      quotation.status = 'expired';
      await this.quotationRepo.save(quotation);
      throw new ValidationError('Báo giá đã hết hạn. Vui lòng tạo báo giá mới.');
    }

    quotation.status = 'accepted';
    await this.quotationRepo.save(quotation);

    return {
      quote_id: quotation.id,
      quote_number: quotation.quoteNumber,
      status: 'accepted',
      message: 'Báo giá đã được chấp nhận. Vui lòng tiến hành thanh toán.',
      total_premium: quotation.totalPremium,
    };
  }

  /**
   * Create a travel insurance quote
   */
  async createTravelQuote(input: TravelQuoteInput, customerId?: string) {
    const quoteResult = TravelQuoteEngineService.calculateTravelQuote(input);
    const quoteNumber = this.generateQuoteNumber('TRV');

    const quotation = this.quotationRepo.create({
      quoteNumber,
      customerId,
      productId: '00000000-0000-0000-0000-000000000000',
      insurerId: '00000000-0000-0000-0000-000000000000',
      insuranceType: 'travel',
      inputData: input as any,
      coverageOptions: {
        plan_type: input.plan_type,
        trip_type: input.trip_type,
        destination_type: input.destination_type,
        coverage_options: input.coverage_options,
      },
      premium: quoteResult.base_premium,
      basePremium: quoteResult.base_premium,
      discount: quoteResult.discount,
      tax: quoteResult.tax,
      totalPremium: quoteResult.total_premium,
      premiumBreakdown: quoteResult.premium_breakdown as any,
      status: 'quoted',
      validUntil: new Date(quoteResult.valid_until),
      metadata: {
        coverage_details: quoteResult.coverage_details,
        trip_duration_days: quoteResult.trip_duration_days,
        premium_per_person: quoteResult.premium_per_person,
        num_travelers: input.travelers.length,
      },
    });

    const saved = await this.quotationRepo.save(quotation);

    return {
      quote_id: saved.id,
      quote_number: saved.quoteNumber,
      insurance_type: 'travel',
      trip: {
        type: input.trip_type,
        destination: input.destination_type,
        destination_country: input.destination_country,
        departure_date: input.departure_date,
        return_date: input.return_date,
        duration_days: quoteResult.trip_duration_days,
        purpose: input.trip_purpose,
      },
      travelers: input.travelers.length,
      plan_type: input.plan_type,
      premium: {
        base: quoteResult.base_premium,
        discount: quoteResult.discount,
        tax: quoteResult.tax,
        total: quoteResult.total_premium,
        per_person: quoteResult.premium_per_person,
      },
      premium_breakdown: quoteResult.premium_breakdown,
      coverage_details: quoteResult.coverage_details,
      valid_until: quoteResult.valid_until,
      status: 'quoted',
    };
  }

  /**
   * Get quick travel quote without saving
   */
  async getQuickTravelQuote(input: TravelQuoteInput) {
    const quoteResult = TravelQuoteEngineService.calculateTravelQuote(input);

    return {
      premium: {
        base: quoteResult.base_premium,
        discount: quoteResult.discount,
        tax: quoteResult.tax,
        total: quoteResult.total_premium,
        per_person: quoteResult.premium_per_person,
      },
      trip_duration_days: quoteResult.trip_duration_days,
      premium_breakdown: quoteResult.premium_breakdown,
      coverage_details: quoteResult.coverage_details,
      valid_until: quoteResult.valid_until,
    };
  }

  /**
   * Get multi-insurer travel quotes for comparison
   */
  async getMultiInsurerTravelQuotes(input: TravelQuoteInput) {
    const tripDays = Math.ceil(
      (new Date(input.return_date).getTime() - new Date(input.departure_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const quoteRequest: QuoteRequest = {
      insurance_type: 'travel',
      product_id: '',
      customer_info: {
        full_name: input.contact_name,
        phone: input.contact_phone,
        email: input.contact_email,
      },
      coverage_options: {
        plan_type: input.plan_type,
        trip_type: input.trip_type,
        coverage_options: input.coverage_options,
      },
      input_data: {
        trip_type: input.trip_type,
        destination_type: input.destination_type,
        destination_country: input.destination_country,
        departure_date: input.departure_date,
        return_date: input.return_date,
        trip_purpose: input.trip_purpose,
        trip_duration_days: tripDays,
        num_travelers: input.travelers.length,
        travelers: input.travelers,
      },
    };

    const { quotes, errors } = await this.insurerRegistry.getMultiInsurerQuotes(quoteRequest);

    const formattedQuotes = quotes.map((q) => ({
      insurer: {
        code: q.insurer_code,
        name: q.insurer_name,
        rating: q.metadata?.rating || 4.0,
        features: q.metadata?.features || [],
      },
      product_name: q.product_name,
      premium: {
        base: q.base_premium,
        discount: q.discount,
        tax: q.tax,
        total: q.total_premium,
      },
      premium_breakdown: q.premium_breakdown,
      coverage_details: q.coverage_details,
      valid_until: q.valid_until,
      quote_ref: q.metadata?.quote_ref,
    }));

    return {
      quotes: formattedQuotes,
      total_quotes: formattedQuotes.length,
      errors: errors.length > 0 ? errors : undefined,
      trip: {
        type: input.trip_type,
        destination: input.destination_type,
        departure_date: input.departure_date,
        return_date: input.return_date,
        duration_days: tripDays,
        travelers: input.travelers.length,
      },
    };
  }

  /**
   * Create a health insurance quote
   */
  async createHealthQuote(input: HealthQuoteInput, customerId?: string) {
    const quoteResult = HealthQuoteEngineService.calculateHealthQuote(input);
    const quoteNumber = this.generateQuoteNumber('HLT');

    const quotation = this.quotationRepo.create({
      quoteNumber,
      customerId,
      productId: '00000000-0000-0000-0000-000000000000',
      insurerId: '00000000-0000-0000-0000-000000000000',
      insuranceType: 'health',
      inputData: input as any,
      coverageOptions: {
        plan_type: input.plan_type,
        coverage_type: input.coverage_type,
        coverage_options: input.coverage_options,
      },
      premium: quoteResult.base_premium,
      basePremium: quoteResult.base_premium,
      discount: quoteResult.discount,
      tax: quoteResult.tax,
      totalPremium: quoteResult.total_premium,
      premiumBreakdown: quoteResult.premium_breakdown as any,
      status: 'quoted',
      validUntil: new Date(quoteResult.valid_until),
      metadata: {
        coverage_details: quoteResult.coverage_details,
        waiting_periods: quoteResult.waiting_periods,
        members_count: quoteResult.members_count,
        premium_per_person: quoteResult.premium_per_person,
      },
    });

    const saved = await this.quotationRepo.save(quotation);

    return {
      quote_id: saved.id,
      quote_number: saved.quoteNumber,
      insurance_type: 'health',
      plan_type: input.plan_type,
      members_count: quoteResult.members_count,
      premium: {
        base: quoteResult.base_premium,
        discount: quoteResult.discount,
        tax: quoteResult.tax,
        total: quoteResult.total_premium,
        per_person: quoteResult.premium_per_person,
      },
      premium_breakdown: quoteResult.premium_breakdown,
      coverage_details: quoteResult.coverage_details,
      waiting_periods: quoteResult.waiting_periods,
      valid_until: quoteResult.valid_until,
      status: 'quoted',
    };
  }

  /**
   * Get quick health quote without saving
   */
  async getQuickHealthQuote(input: HealthQuoteInput) {
    const quoteResult = HealthQuoteEngineService.calculateHealthQuote(input);
    return {
      premium: {
        base: quoteResult.base_premium,
        discount: quoteResult.discount,
        tax: quoteResult.tax,
        total: quoteResult.total_premium,
        per_person: quoteResult.premium_per_person,
      },
      members_count: quoteResult.members_count,
      premium_breakdown: quoteResult.premium_breakdown,
      coverage_details: quoteResult.coverage_details,
      waiting_periods: quoteResult.waiting_periods,
      valid_until: quoteResult.valid_until,
    };
  }

  /**
   * Get multi-insurer health quotes
   */
  async getMultiInsurerHealthQuotes(input: HealthQuoteInput) {
    const quoteRequest: QuoteRequest = {
      insurance_type: 'health',
      product_id: '',
      customer_info: {
        full_name: input.applicant.full_name,
        phone: input.applicant.phone,
        email: input.applicant.email,
      },
      coverage_options: {
        plan_type: input.plan_type,
        coverage_type: input.coverage_type,
        coverage_options: input.coverage_options,
      },
      input_data: {
        plan_type: input.plan_type,
        members_count: (input.family_members?.length || 0) + 1,
        applicant_age: this.calculateAgeFromDob(input.applicant.date_of_birth),
        is_family_plan: input.is_family_plan,
        health_declaration: input.health_declaration,
      },
    };

    const { quotes, errors } = await this.insurerRegistry.getMultiInsurerQuotes(quoteRequest);

    const formattedQuotes = quotes.map((q) => ({
      insurer: {
        code: q.insurer_code,
        name: q.insurer_name,
        rating: q.metadata?.rating || 4.0,
        features: q.metadata?.features || [],
      },
      product_name: q.product_name,
      premium: {
        base: q.base_premium,
        discount: q.discount,
        tax: q.tax,
        total: q.total_premium,
      },
      coverage_details: q.coverage_details,
      valid_until: q.valid_until,
      quote_ref: q.metadata?.quote_ref,
    }));

    return {
      quotes: formattedQuotes,
      total_quotes: formattedQuotes.length,
      errors: errors.length > 0 ? errors : undefined,
      plan_type: input.plan_type,
      members_count: (input.family_members?.length || 0) + 1,
    };
  }

  private calculateAgeFromDob(dob: string): number {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  private generateQuoteNumber(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = uuidv4().split('-')[0].toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private formatQuotation(q: Quotation) {
    return {
      id: q.id,
      quote_number: q.quoteNumber,
      insurance_type: q.insuranceType,
      input_data: q.inputData,
      coverage_options: q.coverageOptions,
      premium: {
        base: q.basePremium,
        discount: q.discount,
        tax: q.tax,
        total: q.totalPremium,
      },
      premium_breakdown: q.premiumBreakdown,
      status: q.status,
      valid_until: q.validUntil,
      created_at: q.createdAt,
    };
  }
}
