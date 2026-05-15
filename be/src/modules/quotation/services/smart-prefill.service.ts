import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';

export interface PrefillData {
  personal_info: {
    full_name?: string;
    email?: string;
    phone?: string;
    id_number?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    city?: string;
    occupation?: string;
    marital_status?: string;
  };
  vehicle_info?: {
    plate_number?: string;
    make?: string;
    model?: string;
    year?: number;
    engine_cc?: number;
    vehicle_type?: string;
    usage_type?: string;
  };
  health_info?: {
    height?: number;
    weight?: number;
    smoking?: boolean;
    pre_existing_conditions?: string[];
    last_health_declaration?: Record<string, any>;
  };
  property_info?: {
    address?: string;
    property_type?: string;
    built_year?: number;
    area_sqm?: number;
    construction_type?: string;
  };
  beneficiaries?: Array<{
    full_name: string;
    relationship: string;
    percentage: number;
    phone?: string;
    id_number?: string;
  }>;
  payment_info?: {
    preferred_method?: string;
    last_used_method?: string;
  };
  preferences?: {
    preferred_insurers?: string[];
    preferred_coverage_level?: 'basic' | 'standard' | 'premium';
    preferred_payment_term?: string;
    last_insurance_type?: string;
  };
  confidence_scores: {
    personal_info: number; // 0-100
    vehicle_info: number;
    health_info: number;
    property_info: number;
    overall: number;
  };
  data_sources: string[]; // Where the data came from
}

export class SmartPrefillService {
  /**
   * Get smart pre-fill data for a customer based on their history
   */
  async getPrefillData(customerId: string, insuranceType?: string): Promise<PrefillData> {
    const [personalInfo, vehicleInfo, healthInfo, propertyInfo, beneficiaries, paymentInfo, preferences] = await Promise.all([
      this.getPersonalInfo(customerId),
      insuranceType === 'motor' ? this.getVehicleInfo(customerId) : null,
      ['health', 'life'].includes(insuranceType || '') ? this.getHealthInfo(customerId) : null,
      ['property', 'home'].includes(insuranceType || '') ? this.getPropertyInfo(customerId) : null,
      this.getBeneficiaries(customerId),
      this.getPaymentPreferences(customerId),
      this.getPreferences(customerId),
    ]);

    const confidenceScores = this.calculateConfidenceScores(personalInfo, vehicleInfo, healthInfo, propertyInfo);
    const dataSources = this.identifyDataSources(personalInfo, vehicleInfo, healthInfo);

    logger.info(`[Prefill] Generated for customer=${customerId}, type=${insuranceType}, confidence=${confidenceScores.overall}%`);

    return {
      personal_info: personalInfo,
      vehicle_info: vehicleInfo || undefined,
      health_info: healthInfo || undefined,
      property_info: propertyInfo || undefined,
      beneficiaries: beneficiaries.length > 0 ? beneficiaries : undefined,
      payment_info: paymentInfo,
      preferences,
      confidence_scores: confidenceScores,
      data_sources: dataSources,
    };
  }

  /**
   * Save form data for future pre-fill (learning from submissions)
   */
  async saveFormData(customerId: string, insuranceType: string, formData: Record<string, any>): Promise<void> {
    await AppDataSource.query(
      `INSERT INTO customer_form_history (id, customer_id, insurance_type, form_data, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      [customerId, insuranceType, JSON.stringify(formData)]
    );
  }

  // ============ Private Methods ============

  private async getPersonalInfo(customerId: string): Promise<PrefillData['personal_info']> {
    // Get from customer profile
    const customer = await AppDataSource.query(
      `SELECT full_name, email, phone, id_number, date_of_birth, gender, address, city, occupation, marital_status
       FROM customer WHERE id = $1`,
      [customerId]
    );

    if (customer.length === 0) return {};

    const c = customer[0];

    // Also check latest purchase order for any updated info
    const latestOrder = await AppDataSource.query(
      `SELECT personal_info FROM purchase_order 
       WHERE customer_id = $1 AND personal_info IS NOT NULL
       ORDER BY created_at DESC LIMIT 1`,
      [customerId]
    );

    const orderInfo = latestOrder[0]?.personal_info || {};

    // Merge: prefer most recent data
    return {
      full_name: orderInfo.full_name || c.full_name || undefined,
      email: orderInfo.email || c.email || undefined,
      phone: orderInfo.phone || c.phone || undefined,
      id_number: orderInfo.id_number || c.id_number || undefined,
      date_of_birth: c.date_of_birth ? new Date(c.date_of_birth).toISOString().slice(0, 10) : undefined,
      gender: c.gender || undefined,
      address: orderInfo.address || c.address || undefined,
      city: c.city || undefined,
      occupation: c.occupation || undefined,
      marital_status: c.marital_status || undefined,
    };
  }

  private async getVehicleInfo(customerId: string): Promise<PrefillData['vehicle_info'] | null> {
    // Get from latest motor insurance form history or quotation
    const motorData = await AppDataSource.query(`
      SELECT q.form_data
      FROM quotation q
      JOIN product p ON q.product_id = p.id
      WHERE q.customer_id = $1 AND p.insurance_type = 'motor'
      ORDER BY q.created_at DESC LIMIT 1
    `, [customerId]);

    if (motorData.length === 0) {
      // Check form history
      const formHistory = await AppDataSource.query(
        `SELECT form_data FROM customer_form_history 
         WHERE customer_id = $1 AND insurance_type = 'motor'
         ORDER BY created_at DESC LIMIT 1`,
        [customerId]
      );
      if (formHistory.length === 0) return null;
      const fd = formHistory[0].form_data;
      return {
        plate_number: fd.plate_number,
        make: fd.make || fd.vehicle_make,
        model: fd.model || fd.vehicle_model,
        year: fd.year || fd.manufacture_year,
        engine_cc: fd.engine_cc,
        vehicle_type: fd.vehicle_type,
        usage_type: fd.usage_type,
      };
    }

    const formData = motorData[0].form_data || {};
    return {
      plate_number: formData.plate_number || formData.vehicle?.plate_number,
      make: formData.make || formData.vehicle?.make,
      model: formData.model || formData.vehicle?.model,
      year: formData.year || formData.vehicle?.year,
      engine_cc: formData.engine_cc || formData.vehicle?.engine_cc,
      vehicle_type: formData.vehicle_type || formData.vehicle?.type,
      usage_type: formData.usage_type || formData.vehicle?.usage,
    };
  }

  private async getHealthInfo(customerId: string): Promise<PrefillData['health_info'] | null> {
    // Get from latest health/life insurance form
    const healthData = await AppDataSource.query(`
      SELECT q.form_data
      FROM quotation q
      JOIN product p ON q.product_id = p.id
      WHERE q.customer_id = $1 AND p.insurance_type IN ('health', 'life')
      ORDER BY q.created_at DESC LIMIT 1
    `, [customerId]);

    if (healthData.length === 0) {
      const formHistory = await AppDataSource.query(
        `SELECT form_data FROM customer_form_history 
         WHERE customer_id = $1 AND insurance_type IN ('health', 'life')
         ORDER BY created_at DESC LIMIT 1`,
        [customerId]
      );
      if (formHistory.length === 0) return null;
      const fd = formHistory[0].form_data;
      return {
        height: fd.height,
        weight: fd.weight,
        smoking: fd.smoking,
        pre_existing_conditions: fd.pre_existing_conditions || fd.conditions,
        last_health_declaration: fd.health_declaration,
      };
    }

    const formData = healthData[0].form_data || {};
    return {
      height: formData.height || formData.health?.height,
      weight: formData.weight || formData.health?.weight,
      smoking: formData.smoking ?? formData.health?.smoking,
      pre_existing_conditions: formData.pre_existing_conditions || formData.conditions || [],
      last_health_declaration: formData.health_declaration,
    };
  }

  private async getPropertyInfo(customerId: string): Promise<PrefillData['property_info'] | null> {
    const propertyData = await AppDataSource.query(`
      SELECT q.form_data
      FROM quotation q
      JOIN product p ON q.product_id = p.id
      WHERE q.customer_id = $1 AND p.insurance_type IN ('property', 'home')
      ORDER BY q.created_at DESC LIMIT 1
    `, [customerId]);

    if (propertyData.length === 0) {
      const formHistory = await AppDataSource.query(
        `SELECT form_data FROM customer_form_history 
         WHERE customer_id = $1 AND insurance_type IN ('property', 'home')
         ORDER BY created_at DESC LIMIT 1`,
        [customerId]
      );
      if (formHistory.length === 0) return null;
      const fd = formHistory[0].form_data;
      return {
        address: fd.property_address || fd.address,
        property_type: fd.property_type,
        built_year: fd.built_year,
        area_sqm: fd.area_sqm || fd.area,
        construction_type: fd.construction_type,
      };
    }

    const formData = propertyData[0].form_data || {};
    return {
      address: formData.property_address || formData.property?.address,
      property_type: formData.property_type || formData.property?.type,
      built_year: formData.built_year || formData.property?.built_year,
      area_sqm: formData.area_sqm || formData.property?.area,
      construction_type: formData.construction_type || formData.property?.construction,
    };
  }

  private async getBeneficiaries(customerId: string): Promise<PrefillData['beneficiaries']> {
    // Get from latest policy beneficiaries
    const beneficiaries = await AppDataSource.query(`
      SELECT DISTINCT b.full_name, b.relationship, b.percentage, b.phone, b.id_number
      FROM beneficiary b
      JOIN policy p ON b.policy_id = p.id
      WHERE p.customer_id = $1
      ORDER BY b.percentage DESC
      LIMIT 5
    `, [customerId]);

    return beneficiaries.map((b: any) => ({
      full_name: b.full_name,
      relationship: b.relationship,
      percentage: parseFloat(b.percentage),
      phone: b.phone || undefined,
      id_number: b.id_number || undefined,
    }));
  }

  private async getPaymentPreferences(customerId: string): Promise<PrefillData['payment_info']> {
    const lastPayment = await AppDataSource.query(`
      SELECT payment_method FROM payment
      WHERE customer_id = $1 AND status = 'paid'
      ORDER BY paid_at DESC LIMIT 1
    `, [customerId]);

    // Most used payment method
    const preferredMethod = await AppDataSource.query(`
      SELECT payment_method, COUNT(*) as count
      FROM payment WHERE customer_id = $1 AND status = 'paid'
      GROUP BY payment_method ORDER BY count DESC LIMIT 1
    `, [customerId]);

    return {
      preferred_method: preferredMethod[0]?.payment_method || undefined,
      last_used_method: lastPayment[0]?.payment_method || undefined,
    };
  }

  private async getPreferences(customerId: string): Promise<PrefillData['preferences']> {
    // Get preferred insurers (most purchased from)
    const insurers = await AppDataSource.query(`
      SELECT i.id, i.name, COUNT(*) as count
      FROM policy p JOIN insurer i ON p.insurer_id = i.id
      WHERE p.customer_id = $1
      GROUP BY i.id, i.name ORDER BY count DESC LIMIT 3
    `, [customerId]);

    // Last insurance type
    const lastType = await AppDataSource.query(`
      SELECT pr.insurance_type FROM policy p
      JOIN product pr ON p.product_id = pr.id
      WHERE p.customer_id = $1
      ORDER BY p.created_at DESC LIMIT 1
    `, [customerId]);

    // Coverage level preference
    const avgPremium = await AppDataSource.query(`
      SELECT AVG(premium_amount) as avg FROM policy WHERE customer_id = $1`,
      [customerId]
    );
    const avg = parseFloat(avgPremium[0]?.avg) || 0;
    let coverageLevel: 'basic' | 'standard' | 'premium' = 'standard';
    if (avg > 20000000) coverageLevel = 'premium';
    else if (avg < 5000000) coverageLevel = 'basic';

    return {
      preferred_insurers: insurers.map((i: any) => i.id),
      preferred_coverage_level: coverageLevel,
      preferred_payment_term: 'annual',
      last_insurance_type: lastType[0]?.insurance_type || undefined,
    };
  }

  private calculateConfidenceScores(personal: any, vehicle: any, health: any, property: any) {
    const personalScore = this.scoreCompleteness(personal, ['full_name', 'email', 'phone', 'id_number', 'date_of_birth', 'address']);
    const vehicleScore = vehicle ? this.scoreCompleteness(vehicle, ['plate_number', 'make', 'model', 'year']) : 0;
    const healthScore = health ? this.scoreCompleteness(health, ['height', 'weight', 'smoking']) : 0;
    const propertyScore = property ? this.scoreCompleteness(property, ['address', 'property_type', 'area_sqm']) : 0;

    const scores = [personalScore];
    if (vehicle) scores.push(vehicleScore);
    if (health) scores.push(healthScore);
    if (property) scores.push(propertyScore);

    return {
      personal_info: personalScore,
      vehicle_info: vehicleScore,
      health_info: healthScore,
      property_info: propertyScore,
      overall: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    };
  }

  private scoreCompleteness(data: Record<string, any>, fields: string[]): number {
    if (!data) return 0;
    const filled = fields.filter(f => data[f] !== null && data[f] !== undefined && data[f] !== '').length;
    return Math.round((filled / fields.length) * 100);
  }

  private identifyDataSources(personal: any, vehicle: any, health: any): string[] {
    const sources: string[] = [];
    if (personal?.full_name) sources.push('customer_profile');
    if (vehicle) sources.push('previous_motor_quote');
    if (health) sources.push('previous_health_declaration');
    if (personal?.id_number) sources.push('ekyc_verification');
    return sources.length > 0 ? sources : ['no_history'];
  }
}
