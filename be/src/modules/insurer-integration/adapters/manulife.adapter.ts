/**
 * Manulife Insurance Adapter (#4 - Health Insurance Partner)
 */
import { BaseInsurerAdapter, QuoteRequest, QuoteResponse, InsurerConfig } from './base.adapter';

export class ManulifeAdapter extends BaseInsurerAdapter {
  constructor() {
    const config: InsurerConfig = {
      code: 'manulife',
      name: 'Manulife Việt Nam',
      base_url: process.env.MANULIFE_API_URL || 'https://api.manulife.com.vn',
      api_key: process.env.MANULIFE_API_KEY || 'demo_key',
      timeout: 10000,
      supported_products: ['health', 'life'],
    };
    super(config);
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    await this.simulateDelay(400, 900);

    if (request.insurance_type === 'health') {
      return this.calculateHealthQuote(request);
    }

    throw new Error(`Manulife does not support ${request.insurance_type}`);
  }

  private calculateHealthQuote(request: QuoteRequest): QuoteResponse {
    const inputData = request.input_data || {};
    const planType = request.coverage_options?.plan_type || 'standard';
    const membersCount = inputData.members_count || 1;

    // Manulife-specific pricing
    const planRates: Record<string, number> = {
      basic: 4000000,
      standard: 9000000,
      premium: 18000000,
      platinum: 35000000,
    };

    const basePerPerson = planRates[planType] || 9000000;
    const basePremium = basePerPerson * membersCount;
    const discount = membersCount >= 3 ? basePremium * 0.12 : membersCount >= 2 ? basePremium * 0.05 : 0;
    const tax = Math.round((basePremium - discount) * 0.1);
    const total = basePremium - discount + tax;

    return {
      insurer_code: this.config.code,
      insurer_name: this.config.name,
      product_name: 'Manulife - Sống Khỏe Mỗi Ngày',
      base_premium: basePremium,
      discount,
      tax,
      total_premium: total,
      premium_breakdown: {
        per_person: basePerPerson,
        members: membersCount,
        base: basePremium,
        family_discount: discount,
        vat: tax,
      },
      coverage_details: [
        { name: 'Chi phí y tế nội trú', coverage_amount: 2000000000, description: 'Tối đa 2 tỷ/năm' },
        { name: 'Phẫu thuật', coverage_amount: 500000000, description: 'Tối đa 500 triệu/lần' },
        { name: 'Ngoại trú', coverage_amount: 150000000, description: 'Tối đa 150 triệu/năm' },
        { name: 'Nha khoa', coverage_amount: 15000000, description: 'Tối đa 15 triệu/năm' },
        { name: 'Thai sản', coverage_amount: 80000000, description: 'Chờ 9 tháng' },
      ],
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        quote_ref: `ML-HLT-${Date.now()}`,
        rating: 4.5,
        features: ['Mạng lưới 300+ bệnh viện', 'Bảo lãnh viện phí', 'App quản lý sức khỏe', 'Không cần giám định ban đầu'],
      },
    };
  }

  async submitApplication(_request: any): Promise<any> {
    return { success: true, application_ref: `ML-APP-${Date.now()}`, status: 'submitted' };
  }

  async getApplicationStatus(ref: string): Promise<any> {
    return { ref, status: 'approved' };
  }

  private simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
