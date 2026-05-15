/**
 * Insurer Integration Layer - Adapter Pattern
 * 
 * Each insurer has a different API. This adapter normalizes
 * their responses into a common format for our system.
 * 
 * In production, each adapter would make real HTTP calls.
 * Currently using mock implementations.
 */

import { logger } from '../../shared/utils/logger';

export interface InsurerQuoteRequest {
  productType: string;
  inputData: Record<string, any>;
  sumInsured: number;
  deductible: number;
}

export interface InsurerQuoteResponse {
  insurerCode: string;
  premiumAnnual: number;
  premiumMonthly: number;
  sumInsured: number;
  deductible: number;
  benefits: string[];
  exclusions: string[];
  terms: string;
  isAvailable: boolean;
  responseTime: number; // ms
}

export interface InsurerPolicyRequest {
  quoteRef: string;
  insuredInfo: Record<string, any>;
  beneficiaries: Array<Record<string, any>>;
  startDate: string;
  paymentRef: string;
}

export interface InsurerPolicyResponse {
  insurerPolicyNumber: string;
  documentUrl: string;
  certificateUrl: string;
  status: string;
}

/**
 * Base adapter interface - all insurer adapters must implement this
 */
export interface IInsurerAdapter {
  code: string;
  name: string;
  getQuote(request: InsurerQuoteRequest): Promise<InsurerQuoteResponse>;
  issuePolicy(request: InsurerPolicyRequest): Promise<InsurerPolicyResponse>;
  checkPolicyStatus(policyRef: string): Promise<string>;
}

/**
 * Bao Viet adapter (mock)
 */
export class BaoVietAdapter implements IInsurerAdapter {
  code = 'BAOVIET';
  name = 'Bảo Việt';

  async getQuote(request: InsurerQuoteRequest): Promise<InsurerQuoteResponse> {
    const start = Date.now();
    // Simulate API latency
    await this.simulateDelay(200, 500);

    const basePremium = this.calculatePremium(request);
    
    return {
      insurerCode: this.code,
      premiumAnnual: basePremium,
      premiumMonthly: Math.round(basePremium / 12),
      sumInsured: request.sumInsured,
      deductible: request.deductible,
      benefits: this.getBenefits(request.productType),
      exclusions: ['Chiến tranh, khủng bố', 'Hành vi cố ý'],
      terms: 'https://baoviet.com.vn/terms',
      isAvailable: true,
      responseTime: Date.now() - start,
    };
  }

  async issuePolicy(request: InsurerPolicyRequest): Promise<InsurerPolicyResponse> {
    await this.simulateDelay(500, 1000);
    const policyNum = `BV-${Date.now().toString(36).toUpperCase()}`;
    
    logger.info(`[BaoViet] Policy issued: ${policyNum}`);
    
    return {
      insurerPolicyNumber: policyNum,
      documentUrl: `https://docs.baoviet.com.vn/policies/${policyNum}.pdf`,
      certificateUrl: `https://docs.baoviet.com.vn/certs/${policyNum}.pdf`,
      status: 'issued',
    };
  }

  async checkPolicyStatus(policyRef: string): Promise<string> {
    await this.simulateDelay(100, 200);
    return 'active';
  }

  private calculatePremium(request: InsurerQuoteRequest): number {
    // Bao Viet tends to be mid-range pricing
    const baseRate = request.productType === 'motor' ? 0.014 : 0.024;
    return Math.round(request.sumInsured * baseRate);
  }

  private getBenefits(productType: string): string[] {
    if (productType === 'motor') {
      return [
        'TNDS: 150 triệu/vụ về người, 50 triệu về tài sản',
        'Vật chất xe: 100% giá trị',
        'Mất cắp toàn bộ: 100%',
        'Hỗ trợ cứu hộ 24/7',
        'Tai nạn lái xe & người ngồi trên xe',
      ];
    }
    return ['Chi phí nội trú 100%', 'Ngoại trú 80%', 'Nha khoa 5 triệu/năm'];
  }

  private simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min) + min);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * PVI adapter (mock)
 */
export class PVIAdapter implements IInsurerAdapter {
  code = 'PVI';
  name = 'PVI Insurance';

  async getQuote(request: InsurerQuoteRequest): Promise<InsurerQuoteResponse> {
    const start = Date.now();
    await this.simulateDelay(150, 400);

    const basePremium = this.calculatePremium(request);

    return {
      insurerCode: this.code,
      premiumAnnual: basePremium,
      premiumMonthly: Math.round(basePremium / 12),
      sumInsured: request.sumInsured,
      deductible: request.deductible,
      benefits: this.getBenefits(request.productType),
      exclusions: ['Chiến tranh', 'Hành vi cố ý', 'Lái xe say rượu'],
      terms: 'https://pvi.com.vn/terms',
      isAvailable: true,
      responseTime: Date.now() - start,
    };
  }

  async issuePolicy(request: InsurerPolicyRequest): Promise<InsurerPolicyResponse> {
    await this.simulateDelay(400, 800);
    const policyNum = `PVI-${Date.now().toString(36).toUpperCase()}`;

    logger.info(`[PVI] Policy issued: ${policyNum}`);

    return {
      insurerPolicyNumber: policyNum,
      documentUrl: `https://docs.pvi.com.vn/policies/${policyNum}.pdf`,
      certificateUrl: `https://docs.pvi.com.vn/certs/${policyNum}.pdf`,
      status: 'issued',
    };
  }

  async checkPolicyStatus(policyRef: string): Promise<string> {
    await this.simulateDelay(100, 200);
    return 'active';
  }

  private calculatePremium(request: InsurerQuoteRequest): number {
    // PVI tends to be slightly cheaper
    const baseRate = request.productType === 'motor' ? 0.012 : 0.022;
    return Math.round(request.sumInsured * baseRate);
  }

  private getBenefits(productType: string): string[] {
    if (productType === 'motor') {
      return [
        'TNDS: 100 triệu/vụ về người, 50 triệu về tài sản',
        'Vật chất xe: 90% giá trị',
        'Mất cắp: 80%',
        'Cứu hộ 24/7 trong phạm vi 50km',
      ];
    }
    return ['Chi phí nội trú 100%', 'Ngoại trú 70%'];
  }

  private simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min) + min);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * Bao Minh adapter (mock)
 */
export class BaoMinhAdapter implements IInsurerAdapter {
  code = 'BAOMINH';
  name = 'Bảo Minh';

  async getQuote(request: InsurerQuoteRequest): Promise<InsurerQuoteResponse> {
    const start = Date.now();
    await this.simulateDelay(180, 450);

    const basePremium = this.calculatePremium(request);

    return {
      insurerCode: this.code,
      premiumAnnual: basePremium,
      premiumMonthly: Math.round(basePremium / 12),
      sumInsured: request.sumInsured,
      deductible: request.deductible,
      benefits: this.getBenefits(request.productType),
      exclusions: ['Chiến tranh, bạo động', 'Hành vi cố ý', 'Xe không đăng ký'],
      terms: 'https://baominh.com.vn/terms',
      isAvailable: true,
      responseTime: Date.now() - start,
    };
  }

  async issuePolicy(request: InsurerPolicyRequest): Promise<InsurerPolicyResponse> {
    await this.simulateDelay(300, 700);
    const policyNum = `BM-${Date.now().toString(36).toUpperCase()}`;

    logger.info(`[BaoMinh] Policy issued: ${policyNum}`);

    return {
      insurerPolicyNumber: policyNum,
      documentUrl: `https://docs.baominh.com.vn/policies/${policyNum}.pdf`,
      certificateUrl: `https://docs.baominh.com.vn/certs/${policyNum}.pdf`,
      status: 'issued',
    };
  }

  async checkPolicyStatus(policyRef: string): Promise<string> {
    await this.simulateDelay(100, 200);
    return 'active';
  }

  private calculatePremium(request: InsurerQuoteRequest): number {
    // Bao Minh is competitive pricing
    const baseRate = request.productType === 'motor' ? 0.013 : 0.023;
    return Math.round(request.sumInsured * baseRate);
  }

  private getBenefits(productType: string): string[] {
    if (productType === 'motor') {
      return [
        'TNDS: 150 triệu/vụ',
        'Vật chất xe: 95% giá trị',
        'Mất cắp: 90%',
        'Tai nạn người ngồi trên xe: 15 triệu/người',
        'Hỗ trợ cứu hộ nhanh',
      ];
    }
    return ['Chi phí nội trú 100%', 'Ngoại trú 75%', 'Thai sản 20 triệu'];
  }

  private simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min) + min);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * Insurer Registry - manages all adapter instances
 */
export class InsurerRegistry {
  private static adapters: Map<string, IInsurerAdapter> = new Map();

  static initialize() {
    const baoViet = new BaoVietAdapter();
    const pvi = new PVIAdapter();
    const baoMinh = new BaoMinhAdapter();

    this.adapters.set(baoViet.code, baoViet);
    this.adapters.set(pvi.code, pvi);
    this.adapters.set(baoMinh.code, baoMinh);

    logger.info(`[InsurerRegistry] Initialized ${this.adapters.size} insurer adapters`);
  }

  static getAdapter(code: string): IInsurerAdapter | undefined {
    return this.adapters.get(code);
  }

  static getAllAdapters(): IInsurerAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Fetch quotes from all insurers in parallel
   */
  static async fetchQuotesParallel(request: InsurerQuoteRequest): Promise<InsurerQuoteResponse[]> {
    const adapters = this.getAllAdapters();

    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.getQuote(request)),
    );

    const quotes: InsurerQuoteResponse[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.isAvailable) {
        quotes.push(result.value);
      } else if (result.status === 'rejected') {
        logger.warn(`[InsurerRegistry] Failed to get quote from ${adapters[index].code}: ${result.reason}`);
      }
    });

    // Sort by premium (lowest first)
    return quotes.sort((a, b) => a.premiumAnnual - b.premiumAnnual);
  }

  /**
   * Issue policy through specific insurer
   */
  static async issuePolicy(
    insurerCode: string,
    request: InsurerPolicyRequest,
  ): Promise<InsurerPolicyResponse | null> {
    const adapter = this.getAdapter(insurerCode);
    if (!adapter) {
      logger.error(`[InsurerRegistry] Adapter not found for: ${insurerCode}`);
      return null;
    }

    try {
      return await adapter.issuePolicy(request);
    } catch (error) {
      logger.error(`[InsurerRegistry] Policy issuance failed for ${insurerCode}:`, error);
      return null;
    }
  }
}
