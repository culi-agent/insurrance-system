import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Quotation } from '../entities/Quotation';
import { Product } from '../../products/entities/Product';
import { QuoteEngineService, MotorQuoteInput, QuoteResult } from './quote-engine.service';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class QuotationService {
  private quotationRepo: Repository<Quotation>;
  private productRepo: Repository<Product>;

  constructor() {
    this.quotationRepo = AppDataSource.getRepository(Quotation);
    this.productRepo = AppDataSource.getRepository(Product);
  }

  /**
   * Generate a motor insurance quote
   */
  async createMotorQuote(input: MotorQuoteInput, customerId?: string) {
    // Calculate quote
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
   * Get multi-insurer quotes for comparison
   */
  async getMultiInsurerQuotes(input: MotorQuoteInput) {
    // In production, this would call each insurer's API
    // For Sprint 1, we simulate with rate adjustments
    const baseQuote = QuoteEngineService.calculateMotorQuote(input);

    const insurerQuotes = [
      {
        insurer: { name: 'Bảo Việt', code: 'BAOVIET', rating: 4.5 },
        total_premium: baseQuote.total_premium,
        premium_breakdown: baseQuote.premium_breakdown,
        coverage_details: baseQuote.coverage_details,
      },
      {
        insurer: { name: 'PVI Insurance', code: 'PVI', rating: 4.3 },
        total_premium: Math.round(baseQuote.total_premium * 0.95), // 5% cheaper
        premium_breakdown: {
          ...baseQuote.premium_breakdown,
          total: Math.round(baseQuote.total_premium * 0.95),
        },
        coverage_details: baseQuote.coverage_details,
      },
      {
        insurer: { name: 'Bảo Minh', code: 'BAOMINH', rating: 4.2 },
        total_premium: Math.round(baseQuote.total_premium * 1.02), // 2% more expensive
        premium_breakdown: {
          ...baseQuote.premium_breakdown,
          total: Math.round(baseQuote.total_premium * 1.02),
        },
        coverage_details: baseQuote.coverage_details,
      },
      {
        insurer: { name: 'MIC Insurance', code: 'MIC', rating: 4.1 },
        total_premium: Math.round(baseQuote.total_premium * 0.92), // 8% cheaper
        premium_breakdown: {
          ...baseQuote.premium_breakdown,
          total: Math.round(baseQuote.total_premium * 0.92),
        },
        coverage_details: baseQuote.coverage_details,
      },
    ];

    // Sort by price
    insurerQuotes.sort((a, b) => a.total_premium - b.total_premium);

    return {
      quotes: insurerQuotes,
      valid_until: baseQuote.valid_until,
      vehicle: {
        brand: input.vehicle_brand,
        model: input.vehicle_model,
        year: input.vehicle_year,
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
