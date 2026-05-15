import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export interface EnterpriseAccount {
  id: string;
  company_name: string;
  tax_code: string;
  business_type: string;
  industry: string;
  company_size: string;
  address: any;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  plan: string;
  created_at: string;
}

export interface EnterpriseRegistrationInput {
  company_name: string;
  tax_code: string;
  business_type: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship';
  industry: string;
  company_size: 'small' | 'medium' | 'large' | 'enterprise';
  address: {
    street: string;
    district: string;
    city: string;
    country?: string;
  };
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  admin_user: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
  };
}

export interface EnterpriseDashboard {
  account: EnterpriseAccount;
  stats: {
    total_employees: number;
    active_policies: number;
    total_premium: number;
    total_claims: number;
    pending_claims: number;
    renewal_upcoming: number;
  };
  recent_policies: any[];
  recent_claims: any[];
  monthly_premium_trend: Array<{ month: string; premium: number; policies: number }>;
}

export interface EmployeeInput {
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender: string;
  id_number: string;
  department?: string;
  position?: string;
  join_date?: string;
}

export interface GroupQuoteInput {
  enterprise_id: string;
  insurance_type: 'health' | 'life' | 'accident';
  plan_level: 'basic' | 'standard' | 'premium' | 'platinum';
  employee_ids: string[];
  coverage_options: {
    inpatient: boolean;
    outpatient: boolean;
    dental: boolean;
    maternity: boolean;
    mental_health: boolean;
  };
  payment_frequency: 'annual' | 'semi_annual' | 'quarterly';
  include_dependents: boolean;
}

export interface GroupQuoteResult {
  quote_id: string;
  enterprise_id: string;
  employee_count: number;
  plan_level: string;
  base_premium_per_person: number;
  volume_discount_rate: number;
  total_premium: number;
  discounted_premium: number;
  coverage_summary: any;
  valid_until: string;
}

export class EnterpriseService {
  /**
   * Register new enterprise account
   */
  async register(input: EnterpriseRegistrationInput): Promise<EnterpriseAccount> {
    // Check tax code uniqueness
    const existing = await AppDataSource.query(
      `SELECT id FROM enterprise_account WHERE tax_code = $1`, [input.tax_code]
    );
    if (existing.length > 0) {
      throw new ValidationError('Mã số thuế đã được đăng ký trong hệ thống');
    }

    const id = uuidv4();

    // Create enterprise account
    await AppDataSource.query(
      `INSERT INTO enterprise_account (id, company_name, tax_code, business_type, industry, company_size, address, contact_person, contact_email, contact_phone, status, plan, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending_verification', 'basic', NOW(), NOW())`,
      [id, input.company_name, input.tax_code, input.business_type, input.industry, input.company_size, JSON.stringify(input.address), input.contact_person, input.contact_email, input.contact_phone]
    );

    // Create admin user linked to enterprise
    const adminId = uuidv4();
    await AppDataSource.query(
      `INSERT INTO customer (id, email, phone, password_hash, full_name, role, status, enterprise_id, enterprise_role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'enterprise_admin', 'active', $6, 'admin', NOW(), NOW())`,
      [adminId, input.admin_user.email, input.admin_user.phone, input.admin_user.password, input.admin_user.full_name, id]
    );

    logger.info(`[Enterprise] Registered: ${input.company_name} (${input.tax_code})`);

    return {
      id,
      company_name: input.company_name,
      tax_code: input.tax_code,
      business_type: input.business_type,
      industry: input.industry,
      company_size: input.company_size,
      address: input.address,
      contact_person: input.contact_person,
      contact_email: input.contact_email,
      contact_phone: input.contact_phone,
      status: 'pending_verification',
      plan: 'basic',
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Get enterprise dashboard
   */
  async getDashboard(enterpriseId: string): Promise<EnterpriseDashboard> {
    const account = await AppDataSource.query(
      `SELECT * FROM enterprise_account WHERE id = $1`, [enterpriseId]
    );
    if (account.length === 0) throw new NotFoundError('Tài khoản doanh nghiệp không tìm thấy');

    const [stats, recentPolicies, recentClaims, monthlyTrend] = await Promise.all([
      this.getEnterpriseStats(enterpriseId),
      AppDataSource.query(
        `SELECT p.id, p.policy_number, pr.name as product_name, p.premium_amount, p.status, p.effective_date, p.expiry_date
         FROM policy p JOIN product pr ON p.product_id = pr.id
         WHERE p.enterprise_id = $1 ORDER BY p.created_at DESC LIMIT 5`, [enterpriseId]
      ),
      AppDataSource.query(
        `SELECT c.id, c.claim_number, c.claim_type, c.claim_amount, c.status, c.created_at
         FROM claim c JOIN policy p ON c.policy_id = p.id
         WHERE p.enterprise_id = $1 ORDER BY c.created_at DESC LIMIT 5`, [enterpriseId]
      ),
      AppDataSource.query(`
        SELECT TO_CHAR(p.created_at, 'YYYY-MM') as month, 
               COALESCE(SUM(p.premium_amount), 0) as premium,
               COUNT(*) as policies
        FROM policy p WHERE p.enterprise_id = $1 AND p.created_at > NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(p.created_at, 'YYYY-MM') ORDER BY month
      `, [enterpriseId]),
    ]);

    return {
      account: account[0],
      stats,
      recent_policies: recentPolicies,
      recent_claims: recentClaims,
      monthly_premium_trend: monthlyTrend.map((m: any) => ({
        month: m.month, premium: parseFloat(m.premium), policies: parseInt(m.policies),
      })),
    };
  }

  /**
   * Add employees (single or batch)
   */
  async addEmployees(enterpriseId: string, employees: EmployeeInput[]): Promise<{ added: number; errors: Array<{ index: number; error: string }> }> {
    let added = 0;
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < employees.length; i++) {
      try {
        const emp = employees[i];
        const id = uuidv4();
        await AppDataSource.query(
          `INSERT INTO enterprise_employee (id, enterprise_id, full_name, email, phone, date_of_birth, gender, id_number, department, position, join_date, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', NOW(), NOW())`,
          [id, enterpriseId, emp.full_name, emp.email, emp.phone || null, emp.date_of_birth, emp.gender, emp.id_number, emp.department || null, emp.position || null, emp.join_date || null]
        );
        added++;
      } catch (error: any) {
        errors.push({ index: i, error: error.message || 'Lỗi thêm nhân viên' });
      }
    }

    // Update employee count
    await AppDataSource.query(
      `UPDATE enterprise_account SET employee_count = (SELECT COUNT(*) FROM enterprise_employee WHERE enterprise_id = $1 AND status = 'active'), updated_at = NOW() WHERE id = $1`,
      [enterpriseId]
    );

    logger.info(`[Enterprise] Added ${added} employees to ${enterpriseId}, errors: ${errors.length}`);
    return { added, errors };
  }

  /**
   * Import employees from CSV data
   */
  async importEmployeesCSV(enterpriseId: string, csvData: string): Promise<{ added: number; skipped: number; errors: Array<{ row: number; error: string }> }> {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) throw new ValidationError('File CSV phải có ít nhất 1 dòng dữ liệu');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const employees: EmployeeInput[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((h, idx) => { row[h] = values[idx]; });

        employees.push({
          full_name: row.full_name || row.name,
          email: row.email,
          phone: row.phone,
          date_of_birth: row.date_of_birth || row.dob,
          gender: row.gender,
          id_number: row.id_number || row.cccd,
          department: row.department,
          position: row.position,
          join_date: row.join_date,
        });
      } catch (error: any) {
        errors.push({ row: i + 1, error: 'Dòng không hợp lệ' });
      }
    }

    const result = await this.addEmployees(enterpriseId, employees);
    return { added: result.added, skipped: errors.length, errors: [...errors, ...result.errors.map(e => ({ row: e.index + 2, error: e.error }))] };
  }

  /**
   * List employees
   */
  async listEmployees(enterpriseId: string, page: number = 1, limit: number = 20, department?: string, status?: string): Promise<{ employees: any[]; total: number }> {
    const offset = (page - 1) * limit;
    let where = `WHERE enterprise_id = $1`;
    const params: any[] = [enterpriseId];

    if (department) { params.push(department); where += ` AND department = $${params.length}`; }
    if (status) { params.push(status); where += ` AND status = $${params.length}`; }

    const [employees, countResult] = await Promise.all([
      AppDataSource.query(
        `SELECT * FROM enterprise_employee ${where} ORDER BY full_name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
      AppDataSource.query(`SELECT COUNT(*) as total FROM enterprise_employee ${where}`, params),
    ]);

    return { employees, total: parseInt(countResult[0]?.total) || 0 };
  }

  /**
   * Remove employee
   */
  async removeEmployee(enterpriseId: string, employeeId: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE enterprise_employee SET status = 'terminated', updated_at = NOW() WHERE id = $1 AND enterprise_id = $2`,
      [employeeId, enterpriseId]
    );
  }

  /**
   * Get group insurance quote
   */
  async getGroupQuote(input: GroupQuoteInput): Promise<GroupQuoteResult> {
    const employees = await AppDataSource.query(
      `SELECT id, date_of_birth, gender FROM enterprise_employee WHERE id = ANY($1) AND enterprise_id = $2 AND status = 'active'`,
      [input.employee_ids, input.enterprise_id]
    );

    if (employees.length === 0) throw new ValidationError('Không tìm thấy nhân viên hợp lệ');

    const employeeCount = employees.length;

    // Calculate base premium per person based on plan level
    const basePremiums: Record<string, number> = {
      basic: 3000000,
      standard: 5000000,
      premium: 8000000,
      platinum: 15000000,
    };
    const basePremium = basePremiums[input.plan_level] || 5000000;

    // Coverage add-ons
    let coverageMultiplier = 1.0;
    if (input.coverage_options.dental) coverageMultiplier += 0.15;
    if (input.coverage_options.maternity) coverageMultiplier += 0.20;
    if (input.coverage_options.mental_health) coverageMultiplier += 0.10;
    if (!input.coverage_options.inpatient) coverageMultiplier -= 0.30;
    if (!input.coverage_options.outpatient) coverageMultiplier -= 0.20;

    const premiumPerPerson = basePremium * coverageMultiplier;

    // Volume discount
    let discountRate = 0;
    if (employeeCount >= 500) discountRate = 0.25;
    else if (employeeCount >= 200) discountRate = 0.20;
    else if (employeeCount >= 100) discountRate = 0.15;
    else if (employeeCount >= 50) discountRate = 0.10;
    else if (employeeCount >= 20) discountRate = 0.05;

    // Dependents add 40% per employee
    const dependentMultiplier = input.include_dependents ? 1.4 : 1.0;

    const totalPremium = premiumPerPerson * employeeCount * dependentMultiplier;
    const discountedPremium = totalPremium * (1 - discountRate);

    // Payment frequency adjustment
    const frequencyFactors: Record<string, number> = { annual: 1.0, semi_annual: 1.03, quarterly: 1.05 };
    const finalPremium = discountedPremium * (frequencyFactors[input.payment_frequency] || 1.0);

    const quoteId = uuidv4();
    await AppDataSource.query(
      `INSERT INTO group_insurance_quote (id, enterprise_id, insurance_type, plan_level, employee_count, employee_ids, coverage_options, base_premium_per_person, volume_discount_rate, total_premium, discounted_premium, payment_frequency, include_dependents, status, valid_until, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'valid', NOW() + INTERVAL '30 days', NOW())`,
      [quoteId, input.enterprise_id, input.insurance_type, input.plan_level, employeeCount, JSON.stringify(input.employee_ids), JSON.stringify(input.coverage_options), premiumPerPerson, discountRate, totalPremium, finalPremium, input.payment_frequency, input.include_dependents]
    );

    return {
      quote_id: quoteId,
      enterprise_id: input.enterprise_id,
      employee_count: employeeCount,
      plan_level: input.plan_level,
      base_premium_per_person: premiumPerPerson,
      volume_discount_rate: discountRate,
      total_premium: totalPremium,
      discounted_premium: finalPremium,
      coverage_summary: input.coverage_options,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Purchase group insurance (bulk policy issuance)
   */
  async purchaseGroupInsurance(enterpriseId: string, quoteId: string, paymentMethod: string): Promise<{ order_id: string; policies_issued: number; total_amount: number }> {
    const quote = await AppDataSource.query(
      `SELECT * FROM group_insurance_quote WHERE id = $1 AND enterprise_id = $2 AND status = 'valid'`,
      [quoteId, enterpriseId]
    );
    if (quote.length === 0) throw new NotFoundError('Báo giá không tìm thấy hoặc đã hết hạn');

    const q = quote[0];
    const employeeIds = q.employee_ids || [];

    // Create group order
    const orderId = uuidv4();
    const orderNumber = `GRP-${Date.now().toString(36).toUpperCase()}`;
    await AppDataSource.query(
      `INSERT INTO enterprise_order (id, order_number, enterprise_id, quote_id, employee_count, total_amount, payment_method, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'processing', NOW(), NOW())`,
      [orderId, orderNumber, enterpriseId, quoteId, q.employee_count, q.discounted_premium, paymentMethod]
    );

    // Issue policies for each employee
    let policiesIssued = 0;
    for (const empId of employeeIds) {
      try {
        const policyId = uuidv4();
        const policyNumber = `GP-${Date.now().toString(36).toUpperCase()}-${policiesIssued + 1}`;
        await AppDataSource.query(
          `INSERT INTO policy (id, policy_number, customer_id, enterprise_id, order_id, product_id, insurer_id, insurance_type, premium_amount, effective_date, expiry_date, status, plan_name, metadata, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, (SELECT id FROM product WHERE insurance_type = $6 LIMIT 1), (SELECT insurer_id FROM product WHERE insurance_type = $6 LIMIT 1), $6, $7, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'active', $8, $9, NOW(), NOW())`,
          [policyId, policyNumber, empId, enterpriseId, orderId, q.insurance_type, q.base_premium_per_person, q.plan_level, JSON.stringify({ group_quote_id: quoteId, enterprise_id: enterpriseId })]
        );
        policiesIssued++;
      } catch (error: any) {
        logger.warn(`[Enterprise] Failed to issue policy for employee ${empId}: ${error.message}`);
      }
    }

    // Update order status
    await AppDataSource.query(
      `UPDATE enterprise_order SET status = 'completed', policies_issued = $1, updated_at = NOW() WHERE id = $2`,
      [policiesIssued, orderId]
    );

    // Mark quote as used
    await AppDataSource.query(
      `UPDATE group_insurance_quote SET status = 'purchased', updated_at = NOW() WHERE id = $1`, [quoteId]
    );

    logger.info(`[Enterprise] Group purchase: ${orderNumber}, policies=${policiesIssued}, amount=${q.discounted_premium}`);

    return { order_id: orderId, policies_issued: policiesIssued, total_amount: parseFloat(q.discounted_premium) };
  }

  /**
   * Get enterprise billing/invoices
   */
  async getBilling(enterpriseId: string, page: number = 1, limit: number = 20): Promise<{ invoices: any[]; total: number; summary: any }> {
    const offset = (page - 1) * limit;

    const [invoices, countResult, summary] = await Promise.all([
      AppDataSource.query(
        `SELECT * FROM enterprise_invoice WHERE enterprise_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [enterpriseId, limit, offset]
      ),
      AppDataSource.query(`SELECT COUNT(*) as total FROM enterprise_invoice WHERE enterprise_id = $1`, [enterpriseId]),
      AppDataSource.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending,
          COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as total_overdue
        FROM enterprise_invoice WHERE enterprise_id = $1
      `, [enterpriseId]),
    ]);

    return {
      invoices,
      total: parseInt(countResult[0]?.total) || 0,
      summary: {
        total_paid: parseFloat(summary[0]?.total_paid) || 0,
        total_pending: parseFloat(summary[0]?.total_pending) || 0,
        total_overdue: parseFloat(summary[0]?.total_overdue) || 0,
      },
    };
  }

  /**
   * Generate invoice for enterprise
   */
  async generateInvoice(enterpriseId: string, orderId: string): Promise<any> {
    const order = await AppDataSource.query(
      `SELECT * FROM enterprise_order WHERE id = $1 AND enterprise_id = $2`, [orderId, enterpriseId]
    );
    if (order.length === 0) throw new NotFoundError('Đơn hàng không tìm thấy');

    const invoiceId = uuidv4();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await AppDataSource.query(
      `INSERT INTO enterprise_invoice (id, invoice_number, enterprise_id, order_id, amount, tax_amount, total_amount, due_date, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())`,
      [invoiceId, invoiceNumber, enterpriseId, orderId, order[0].total_amount, parseFloat(order[0].total_amount) * 0.1, parseFloat(order[0].total_amount) * 1.1, dueDate]
    );

    return { id: invoiceId, invoice_number: invoiceNumber, amount: order[0].total_amount, due_date: dueDate.toISOString(), status: 'pending' };
  }

  // ============ Private Methods ============

  private async getEnterpriseStats(enterpriseId: string) {
    const result = await AppDataSource.query(`
      SELECT 
        (SELECT COUNT(*) FROM enterprise_employee WHERE enterprise_id = $1 AND status = 'active') as total_employees,
        (SELECT COUNT(*) FROM policy WHERE enterprise_id = $1 AND status = 'active') as active_policies,
        (SELECT COALESCE(SUM(premium_amount), 0) FROM policy WHERE enterprise_id = $1) as total_premium,
        (SELECT COUNT(*) FROM claim c JOIN policy p ON c.policy_id = p.id WHERE p.enterprise_id = $1) as total_claims,
        (SELECT COUNT(*) FROM claim c JOIN policy p ON c.policy_id = p.id WHERE p.enterprise_id = $1 AND c.status IN ('submitted', 'under_review')) as pending_claims,
        (SELECT COUNT(*) FROM policy WHERE enterprise_id = $1 AND status = 'active' AND expiry_date <= CURRENT_DATE + INTERVAL '30 days') as renewal_upcoming
    `, [enterpriseId]);

    const r = result[0];
    return {
      total_employees: parseInt(r.total_employees) || 0,
      active_policies: parseInt(r.active_policies) || 0,
      total_premium: parseFloat(r.total_premium) || 0,
      total_claims: parseInt(r.total_claims) || 0,
      pending_claims: parseInt(r.pending_claims) || 0,
      renewal_upcoming: parseInt(r.renewal_upcoming) || 0,
    };
  }
}
