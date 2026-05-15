/**
 * Bao Minh Insurance Adapter (#3 - Travel Insurance Partner)
 */
import { BaseInsurerAdapter, QuoteRequest, QuoteResponse, InsurerConfig } from './base.adapter';

export class BaoMinhAdapter extends BaseInsurerAdapter {
  constructor() {
    const config: InsurerConfig = {
      code: 'bao_minh',
      name: 'Bảo Minh',
      base_url: process.env.BAO_MINH_API_URL || 'https://api.baominh.com.vn',
      api_key: process.env.BAO_MINH_API_KEY || 'demo_key',
      timeout: 10000,
      supported_products: ['travel', 'health', 'property'],
    };
    super(config);
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    // Simulate Bao Minh API call for travel insurance
    await this.simulateDelay(300, 800);

    if (request.insurance_type === 'travel') {
      return this.calculateTravelQuote(request);
    }

    throw new Error(`Bảo Minh does not support ${request.insurance_type}`);
  }

  private calculateTravelQuote(request: QuoteRequest): QuoteResponse {
    const inputData = request.input_data || {};
    const tripDays = inputData.trip_duration_days || 7;
    const numTravelers = inputData.num_travelers || 1;
    const destination = inputData.destination_type || 'asia';

    // Bao Minh pricing
    const baseRates: Record<string, number> = {
      domestic: 25000,
      asia: 60000,
      worldwide: 110000,
    };

    const dailyRate = baseRates[destination] || 60000;
    const basePremium = dailyRate * tripDays * numTravelers;
    const discount = numTravelers >= 3 ? basePremium * 0.1 : 0;
    const tax = Math.round((basePremium - discount) * 0.1);
    const total = basePremium - discount + tax;

    return {
      insurer_code: this.config.code,
      insurer_name: this.config.name,
      product_name: 'Bảo Minh Travel Care',
      base_premium: basePremium,
      discount,
      tax,
      total_premium: total,
      premium_breakdown: {
        daily_rate: dailyRate,
        trip_days: tripDays,
        travelers: numTravelers,
        base: basePremium,
        group_discount: discount,
        vat: tax,
      },
      coverage_details: [
        { name: 'Chi phí y tế', coverage_amount: 2000000000, description: 'Tối đa 2 tỷ VND' },
        { name: 'Tai nạn cá nhân', coverage_amount: 500000000, description: 'Tối đa 500 triệu' },
        { name: 'Hành lý', coverage_amount: 30000000, description: 'Tối đa 30 triệu' },
        { name: 'Hủy chuyến', coverage_amount: 40000000, description: 'Tối đa 40 triệu' },
        { name: 'Trễ chuyến bay', coverage_amount: 8000000, description: 'Trễ > 6 tiếng' },
      ],
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        quote_ref: `BM-TRV-${Date.now()}`,
        rating: 4.3,
        features: ['Hỗ trợ 24/7', 'Bồi thường nhanh 3 ngày', 'App theo dõi chuyến đi'],
      },
    };
  }

  async submitApplication(_request: any): Promise<any> {
    return {
      success: true,
      application_ref: `BM-APP-${Date.now()}`,
      status: 'submitted',
    };
  }

  async getApplicationStatus(ref: string): Promise<any> {
    return { ref, status: 'approved' };
  }

  private simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
