import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Quote } from '../entities/Quote';
import { Product } from '../../products/entities/Product';
import { Insurer } from '../../products/entities/Insurer';
import { PricingEngine, PricingResult } from './pricing-engine';
import { NotFoundError } from '../../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class QuoteService {
  private quoteRepo: Repository<Quote>;
  private productRepo: Repository<Product>;
  private insurerRepo: Repository<Insurer>;

  constructor() {
    this.quoteRepo = AppDataSource.getRepository(Quote);
    this.productRepo = AppDataSource.getRepository(Product);
    this.insurerRepo = AppDataSource.getRepository(Insurer);
  }

  /**
   * Generate motor insurance quotes from multiple insurers
   */
  async generateMotorQuotes(input: {
    vehicle_type: string;
    brand: string;
    model: string;
    year: number;
    engine_cc: number;
    usage: string;
    vehicle_value: number;
    license_plate?: string;
    coverage_type: string;
    sum_insured: number;
    add_passenger: boolean;
    passenger_seats: number;
    deductible: number;
    start_date: string;
  }, customerId?: string) {
    // Find active motor insurance products
    const products = await this.productRepo.find({
      where: { status: 'active' },
      relations: ['category', 'insurer'],
    });

    const motorProducts = products.filter(
      (p) => p.category?.slug === 'bao-hiem-xe',
    );

    // Generate quotes from each insurer
    const quotes = await Promise.all(
      motorProducts.map((product) =>
        this.generateSingleMotorQuote(product, input, customerId),
      ),
    );

    // If no motor products, generate mock quotes from active insurers
    if (quotes.length === 0) {
      const insurers = await this.insurerRepo.find({ where: { status: 'active' } });
      const mockQuotes = await Promise.all(
        insurers.slice(0, 4).map((insurer) =>
          this.generateMockMotorQuote(insurer, input, customerId),
        ),
      );
      return this.formatQuoteResponse(mockQuotes, 'motor');
    }

    return this.formatQuoteResponse(quotes, 'motor');
  }

  private async generateSingleMotorQuote(
    product: Product,
    input: any,
    customerId?: string,
  ): Promise<Quote> {
    const pricing = PricingEngine.calculateMotorPremium({
      vehicleValue: input.vehicle_value,
      engineCC: input.engine_cc,
      vehicleType: input.vehicle_type,
      coverageType: input.coverage_type,
      year: input.year,
      deductible: input.deductible,
      addPassenger: input.add_passenger,
      passengerSeats: input.passenger_seats,
    });

    return this.saveQuote({
      customerId,
      productId: product.id,
      insurerId: product.insurerId,
      productType: 'motor',
      inputData: input,
      pricing,
      sumInsured: input.sum_insured || input.vehicle_value,
      deductible: input.deductible,
      insurer: product.insurer,
      product,
    });
  }

  private async generateMockMotorQuote(
    insurer: Insurer,
    input: any,
    customerId?: string,
  ): Promise<Quote> {
    const pricing = PricingEngine.calculateMotorPremium({
      vehicleValue: input.vehicle_value,
      engineCC: input.engine_cc,
      vehicleType: input.vehicle_type,
      coverageType: input.coverage_type,
      year: input.year,
      deductible: input.deductible,
      addPassenger: input.add_passenger,
      passengerSeats: input.passenger_seats,
    });

    // Add insurer-specific variance (±15%)
    const variance = 0.85 + Math.random() * 0.3;
    pricing.totalPremiumAnnual = Math.round(pricing.totalPremiumAnnual * variance);
    pricing.totalPremiumMonthly = Math.round(pricing.totalPremiumAnnual / 12);

    const quote = this.quoteRepo.create({
      customerId,
      productId: uuidv4(), // placeholder
      insurerId: insurer.id,
      quoteNumber: this.generateQuoteNumber('MOT'),
      productType: 'motor',
      inputData: input,
      premiumAnnual: pricing.totalPremiumAnnual,
      premiumMonthly: pricing.totalPremiumMonthly,
      sumInsured: input.sum_insured || input.vehicle_value,
      deductible: input.deductible,
      pricingBreakdown: pricing as any,
      benefitsSummary: this.getMotorBenefits(input.coverage_type),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    const saved = await this.quoteRepo.save(quote);
    (saved as any).insurer = insurer;
    return saved;
  }

  /**
   * Generate health insurance quotes
   */
  async generateHealthQuotes(input: {
    plan_type: string;
    date_of_birth: string;
    gender: string;
    occupation: string;
    smoking: boolean;
    sum_insured: number;
    inpatient: boolean;
    outpatient: boolean;
    dental: boolean;
    maternity: boolean;
    critical_illness: boolean;
    deductible: number;
    start_date: string;
  }, customerId?: string) {
    const insurers = await this.insurerRepo.find({ where: { status: 'active' } });

    const quotes = await Promise.all(
      insurers.slice(0, 4).map((insurer) =>
        this.generateHealthQuoteForInsurer(insurer, input, customerId),
      ),
    );

    return this.formatQuoteResponse(quotes, 'health');
  }

  private async generateHealthQuoteForInsurer(
    insurer: Insurer,
    input: any,
    customerId?: string,
  ): Promise<Quote> {
    const pricing = PricingEngine.calculateHealthPremium({
      dateOfBirth: input.date_of_birth,
      gender: input.gender,
      smoking: input.smoking,
      sumInsured: input.sum_insured,
      inpatient: input.inpatient,
      outpatient: input.outpatient,
      dental: input.dental,
      maternity: input.maternity,
      criticalIllness: input.critical_illness,
      deductible: input.deductible,
      planType: input.plan_type,
    });

    // Add insurer-specific variance
    const variance = 0.88 + Math.random() * 0.24;
    pricing.totalPremiumAnnual = Math.round(pricing.totalPremiumAnnual * variance);
    pricing.totalPremiumMonthly = Math.round(pricing.totalPremiumAnnual / 12);

    const quote = this.quoteRepo.create({
      customerId,
      productId: uuidv4(),
      insurerId: insurer.id,
      quoteNumber: this.generateQuoteNumber('HLT'),
      productType: 'health',
      inputData: input,
      premiumAnnual: pricing.totalPremiumAnnual,
      premiumMonthly: pricing.totalPremiumMonthly,
      sumInsured: input.sum_insured,
      deductible: input.deductible,
      pricingBreakdown: pricing as any,
      benefitsSummary: this.getHealthBenefits(input),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    const saved = await this.quoteRepo.save(quote);
    (saved as any).insurer = insurer;
    return saved;
  }

  /**
   * Generate travel insurance quotes
   */
  async generateTravelQuotes(input: {
    trip_type: string;
    destination: string;
    departure_date: string;
    return_date: string;
    travelers: Array<{ age: number; name: string }>;
    coverage_plan: string;
    activities: string[];
  }, customerId?: string) {
    const insurers = await this.insurerRepo.find({ where: { status: 'active' } });

    const quotes = await Promise.all(
      insurers.slice(0, 3).map((insurer) =>
        this.generateTravelQuoteForInsurer(insurer, input, customerId),
      ),
    );

    return this.formatQuoteResponse(quotes, 'travel');
  }

  private async generateTravelQuoteForInsurer(
    insurer: Insurer,
    input: any,
    customerId?: string,
  ): Promise<Quote> {
    const pricing = PricingEngine.calculateTravelPremium({
      tripType: input.trip_type,
      destination: input.destination,
      departureDate: input.departure_date,
      returnDate: input.return_date,
      travelers: input.travelers,
      coveragePlan: input.coverage_plan,
      activities: input.activities || [],
    });

    const variance = 0.9 + Math.random() * 0.2;
    pricing.totalPremiumAnnual = Math.round(pricing.totalPremiumAnnual * variance);
    pricing.totalPremiumMonthly = Math.round(pricing.totalPremiumAnnual / 12);

    const sumInsuredByPlan: Record<string, number> = {
      basic: 500000000,
      standard: 1000000000,
      premium: 2000000000,
    };

    const quote = this.quoteRepo.create({
      customerId,
      productId: uuidv4(),
      insurerId: insurer.id,
      quoteNumber: this.generateQuoteNumber('TRV'),
      productType: 'travel',
      inputData: input,
      premiumAnnual: pricing.totalPremiumAnnual,
      premiumMonthly: pricing.totalPremiumMonthly,
      sumInsured: sumInsuredByPlan[input.coverage_plan] || 1000000000,
      deductible: 0,
      pricingBreakdown: pricing as any,
      benefitsSummary: this.getTravelBenefits(input.coverage_plan),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'active',
    });

    const saved = await this.quoteRepo.save(quote);
    (saved as any).insurer = insurer;
    return saved;
  }

  /**
   * Get quote by ID
   */
  async getQuoteById(id: string) {
    const quote = await this.quoteRepo.findOne({
      where: { id },
      relations: ['insurer'],
    });
    if (!quote) throw new NotFoundError('Quote không tìm thấy');
    return quote;
  }

  /**
   * Get quotes by customer
   */
  async getCustomerQuotes(customerId: string, filters: {
    status?: string;
    product_type?: string;
    page?: number;
    per_page?: number;
  }) {
    const page = filters.page || 1;
    const perPage = filters.per_page || 10;

    const queryBuilder = this.quoteRepo
      .createQueryBuilder('quote')
      .leftJoinAndSelect('quote.insurer', 'insurer')
      .where('quote.customerId = :customerId', { customerId });

    if (filters.status) {
      queryBuilder.andWhere('quote.status = :status', { status: filters.status });
    }
    if (filters.product_type) {
      queryBuilder.andWhere('quote.productType = :productType', { productType: filters.product_type });
    }

    queryBuilder.orderBy('quote.createdAt', 'DESC');

    const [quotes, total] = await queryBuilder
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { data: quotes, total, page, per_page: perPage };
  }

  // --- Helper methods ---

  private async saveQuote(params: {
    customerId?: string;
    productId: string;
    insurerId: string;
    productType: string;
    inputData: any;
    pricing: PricingResult;
    sumInsured: number;
    deductible: number;
    insurer: Insurer;
    product: Product;
  }): Promise<Quote> {
    const prefix = params.productType === 'motor' ? 'MOT' : 
                   params.productType === 'health' ? 'HLT' : 'TRV';

    const quote = this.quoteRepo.create({
      customerId: params.customerId,
      productId: params.productId,
      insurerId: params.insurerId,
      quoteNumber: this.generateQuoteNumber(prefix),
      productType: params.productType,
      inputData: params.inputData,
      premiumAnnual: params.pricing.totalPremiumAnnual,
      premiumMonthly: params.pricing.totalPremiumMonthly,
      sumInsured: params.sumInsured,
      deductible: params.deductible,
      pricingBreakdown: params.pricing as any,
      benefitsSummary: this.getMotorBenefits(params.inputData.coverage_type),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'active',
    });

    const saved = await this.quoteRepo.save(quote);
    (saved as any).insurer = params.insurer;
    (saved as any).product = params.product;
    return saved;
  }

  private formatQuoteResponse(quotes: Quote[], productType: string) {
    return {
      product_type: productType,
      quotes: quotes.map((q) => ({
        id: q.id,
        quote_number: q.quoteNumber,
        insurer_id: q.insurerId,
        insurer_name: (q as any).insurer?.name || 'Unknown',
        insurer_logo: (q as any).insurer?.logoUrl,
        premium_annual: { amount: q.premiumAnnual, currency: 'VND' },
        premium_monthly: { amount: q.premiumMonthly, currency: 'VND' },
        sum_insured: { amount: q.sumInsured, currency: 'VND' },
        deductible: { amount: q.deductible, currency: 'VND' },
        benefits_summary: q.benefitsSummary,
        pricing_breakdown: q.pricingBreakdown,
        valid_until: q.validUntil,
        status: q.status,
      })),
      valid_until: quotes[0]?.validUntil,
      status: 'active',
    };
  }

  private generateQuoteNumber(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private getMotorBenefits(coverageType: string): string[] {
    if (coverageType === 'comprehensive') {
      return [
        'TNDS bắt buộc: 150 triệu/vụ về người, 50 triệu về tài sản',
        'Vật chất xe: 100% giá trị xe',
        'Mất cắp, cháy nổ: 100% giá trị',
        'Tai nạn người ngồi trên xe: 20 triệu/người',
        'Hỗ trợ cứu hộ 24/7',
      ];
    }
    return [
      'TNDS bắt buộc: 150 triệu/vụ về người',
      'TNDS bắt buộc: 50 triệu/vụ về tài sản',
    ];
  }

  private getHealthBenefits(input: any): string[] {
    const benefits: string[] = ['Nội trú: 100% chi phí trong hạn mức'];
    if (input.outpatient) benefits.push('Ngoại trú: 80% chi phí');
    if (input.dental) benefits.push('Nha khoa: 5 triệu/năm');
    if (input.maternity) benefits.push('Thai sản: 30 triệu/lần sinh');
    if (input.critical_illness) benefits.push('Bệnh hiểm nghèo: 100% sum insured');
    benefits.push('Phòng bệnh: theo hạng phòng đăng ký');
    return benefits;
  }

  private getTravelBenefits(plan: string): string[] {
    const base = [
      'Tai nạn cá nhân',
      'Chi phí y tế khẩn cấp',
      'Hành lý thất lạc/hư hỏng',
      'Hủy/hoãn chuyến bay',
    ];
    if (plan === 'premium') {
      base.push('Sơ tán y tế khẩn cấp');
      base.push('Bồi thường gián đoạn chuyến đi');
      base.push('Trách nhiệm cá nhân');
    }
    return base;
  }
}
