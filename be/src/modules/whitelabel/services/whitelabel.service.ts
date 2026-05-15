import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export interface WhitelabelConfig {
  id: string;
  partner_id: string;
  partner_name: string;
  domain: string;
  branding: {
    logo_url: string;
    favicon_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    company_name: string;
    tagline: string;
  };
  features: {
    products_enabled: string[];
    show_insurer_logos: boolean;
    show_comparison: boolean;
    custom_footer: boolean;
    custom_header: boolean;
    enable_chat: boolean;
    enable_referral: boolean;
  };
  contact: {
    support_email: string;
    support_phone: string;
    address: string;
  };
  seo: {
    title_prefix: string;
    meta_description: string;
    og_image: string;
  };
  status: string;
  created_at: string;
}

export interface BancassurancePartner {
  id: string;
  bank_name: string;
  bank_code: string;
  integration_type: 'api' | 'iframe' | 'redirect';
  api_endpoint: string;
  commission_rate: number;
  products: string[];
  status: string;
  config: any;
}

export class WhitelabelService {
  /**
   * Create whitelabel configuration
   */
  async createConfig(input: Partial<WhitelabelConfig>): Promise<WhitelabelConfig> {
    const id = uuidv4();

    // Validate domain uniqueness
    if (input.domain) {
      const existing = await AppDataSource.query(
        `SELECT id FROM whitelabel_config WHERE domain = $1`, [input.domain]
      );
      if (existing.length > 0) throw new ValidationError('Domain đã được sử dụng');
    }

    await AppDataSource.query(
      `INSERT INTO whitelabel_config (id, partner_id, partner_name, domain, branding, features, contact, seo, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW(), NOW())`,
      [id, input.partner_id, input.partner_name, input.domain, JSON.stringify(input.branding), JSON.stringify(input.features), JSON.stringify(input.contact), JSON.stringify(input.seo)]
    );

    logger.info(`[Whitelabel] Created config for: ${input.partner_name}, domain=${input.domain}`);

    return { ...input, id, status: 'active', created_at: new Date().toISOString() } as WhitelabelConfig;
  }

  /**
   * Get config by domain
   */
  async getConfigByDomain(domain: string): Promise<WhitelabelConfig | null> {
    const config = await AppDataSource.query(
      `SELECT * FROM whitelabel_config WHERE domain = $1 AND status = 'active'`, [domain]
    );
    if (config.length === 0) return null;
    return config[0];
  }

  /**
   * Update branding
   */
  async updateBranding(configId: string, branding: Partial<WhitelabelConfig['branding']>): Promise<void> {
    await AppDataSource.query(
      `UPDATE whitelabel_config SET branding = branding || $1::jsonb, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(branding), configId]
    );
  }

  /**
   * Update features
   */
  async updateFeatures(configId: string, features: Partial<WhitelabelConfig['features']>): Promise<void> {
    await AppDataSource.query(
      `UPDATE whitelabel_config SET features = features || $1::jsonb, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(features), configId]
    );
  }

  /**
   * List all whitelabel configs
   */
  async listConfigs(page: number = 1, limit: number = 20): Promise<{ configs: WhitelabelConfig[]; total: number }> {
    const offset = (page - 1) * limit;
    const [configs, countResult] = await Promise.all([
      AppDataSource.query(`SELECT * FROM whitelabel_config ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
      AppDataSource.query(`SELECT COUNT(*) as total FROM whitelabel_config`),
    ]);
    return { configs, total: parseInt(countResult[0]?.total) || 0 };
  }

  /**
   * Register bancassurance partner
   */
  async registerBancassurance(input: Partial<BancassurancePartner>): Promise<BancassurancePartner> {
    const id = uuidv4();

    await AppDataSource.query(
      `INSERT INTO bancassurance_partner (id, bank_name, bank_code, integration_type, api_endpoint, commission_rate, products, status, config, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, NOW(), NOW())`,
      [id, input.bank_name, input.bank_code, input.integration_type, input.api_endpoint, input.commission_rate || 0.15, JSON.stringify(input.products || []), JSON.stringify(input.config || {})]
    );

    logger.info(`[Bancassurance] Registered: ${input.bank_name} (${input.bank_code})`);
    return { ...input, id, status: 'active' } as BancassurancePartner;
  }

  /**
   * Get bancassurance partner products
   */
  async getBancassuranceProducts(bankCode: string): Promise<any[]> {
    const partner = await AppDataSource.query(
      `SELECT products, commission_rate FROM bancassurance_partner WHERE bank_code = $1 AND status = 'active'`,
      [bankCode]
    );
    if (partner.length === 0) return [];

    const enabledTypes = partner[0].products || [];
    if (enabledTypes.length === 0) return [];

    const products = await AppDataSource.query(
      `SELECT p.id, p.name, p.slug, p.insurance_type, p.short_description, p.min_premium, i.name as insurer_name
       FROM product p JOIN insurer i ON p.insurer_id = i.id
       WHERE p.insurance_type = ANY($1) AND p.status = 'active'
       ORDER BY p.sort_order`,
      [enabledTypes]
    );

    return products;
  }

  /**
   * Process bancassurance sale (from bank integration)
   */
  async processBancassuranceSale(bankCode: string, saleData: any): Promise<any> {
    const partner = await AppDataSource.query(
      `SELECT id, commission_rate FROM bancassurance_partner WHERE bank_code = $1 AND status = 'active'`,
      [bankCode]
    );
    if (partner.length === 0) throw new NotFoundError('Bank partner not found');

    // Log the sale
    const saleId = uuidv4();
    await AppDataSource.query(
      `INSERT INTO bancassurance_sale (id, partner_id, bank_code, customer_data, product_id, premium_amount, commission_amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())`,
      [saleId, partner[0].id, bankCode, JSON.stringify(saleData.customer), saleData.product_id, saleData.premium, saleData.premium * partner[0].commission_rate]
    );

    return { sale_id: saleId, status: 'pending', commission_rate: partner[0].commission_rate };
  }
}
