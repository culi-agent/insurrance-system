import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export type ExportFormat = 'csv' | 'pdf';
export type ReportType = 'sales' | 'financial' | 'customer' | 'product' | 'claims' | 'commission' | 'policies';

export interface ExportRequest {
  report_type: ReportType;
  format: ExportFormat;
  date_range?: { start_date: string; end_date: string };
  filters?: Record<string, any>;
  columns?: string[]; // Custom column selection
}

export interface ExportResult {
  export_id: string;
  filename: string;
  format: ExportFormat;
  content_type: string;
  data: string; // Base64 encoded for PDF, raw string for CSV
  size_bytes: number;
  generated_at: string;
}

export interface ExportHistoryItem {
  id: string;
  report_type: ReportType;
  format: ExportFormat;
  filename: string;
  size_bytes: number;
  generated_by: string;
  generated_at: string;
  download_url: string;
}

export class ReportExportService {
  /**
   * Export report to CSV or PDF
   */
  async exportReport(userId: string, request: ExportRequest): Promise<ExportResult> {
    const exportId = uuidv4();
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `${request.report_type}_report_${timestamp}.${request.format}`;

    let data: string;
    let contentType: string;

    if (request.format === 'csv') {
      data = await this.generateCSV(request);
      contentType = 'text/csv';
    } else {
      data = await this.generatePDF(request);
      contentType = 'application/pdf';
    }

    // Save export history
    await AppDataSource.query(
      `INSERT INTO report_export (id, report_type, format, filename, size_bytes, filters, generated_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [exportId, request.report_type, request.format, filename, Buffer.byteLength(data), JSON.stringify(request.filters || {}), userId]
    );

    logger.info(`[Export] Report exported: ${filename} by user ${userId}`);

    return {
      export_id: exportId,
      filename,
      format: request.format,
      content_type: contentType,
      data,
      size_bytes: Buffer.byteLength(data),
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Get export history
   */
  async getExportHistory(userId: string, page: number = 1, limit: number = 20): Promise<{ exports: ExportHistoryItem[]; total: number }> {
    const offset = (page - 1) * limit;

    const [exports, countResult] = await Promise.all([
      AppDataSource.query(
        `SELECT id, report_type, format, filename, size_bytes, generated_by, created_at as generated_at
         FROM report_export WHERE generated_by = $1
         ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      ),
      AppDataSource.query(
        `SELECT COUNT(*) as total FROM report_export WHERE generated_by = $1`,
        [userId]
      ),
    ]);

    return {
      exports: exports.map((e: any) => ({
        id: e.id,
        report_type: e.report_type,
        format: e.format,
        filename: e.filename,
        size_bytes: e.size_bytes,
        generated_by: e.generated_by,
        generated_at: e.generated_at,
        download_url: `/api/v1/admin/analytics/exports/${e.id}/download`,
      })),
      total: parseInt(countResult[0]?.total) || 0,
    };
  }

  // ============ CSV Generation ============

  private async generateCSV(request: ExportRequest): Promise<string> {
    switch (request.report_type) {
      case 'sales':
        return this.generateSalesCSV(request);
      case 'financial':
        return this.generateFinancialCSV(request);
      case 'customer':
        return this.generateCustomerCSV(request);
      case 'product':
        return this.generateProductCSV(request);
      case 'claims':
        return this.generateClaimsCSV(request);
      case 'commission':
        return this.generateCommissionCSV(request);
      case 'policies':
        return this.generatePoliciesCSV(request);
      default:
        return '';
    }
  }

  private async generateSalesCSV(request: ExportRequest): Promise<string> {
    const startDate = request.date_range?.start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = request.date_range?.end_date || new Date().toISOString();

    const data = await AppDataSource.query(`
      SELECT p.policy_number, pr.name as product_name, pr.insurance_type,
             i.name as insurer_name, c.full_name as customer_name,
             p.premium_amount, p.status, p.created_at as sale_date
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      LEFT JOIN insurer i ON p.insurer_id = i.id
      JOIN customer c ON p.customer_id = c.id
      WHERE p.created_at BETWEEN $1 AND $2
      ORDER BY p.created_at DESC
    `, [startDate, endDate]);

    const headers = ['Mã hợp đồng', 'Sản phẩm', 'Loại BH', 'Nhà BH', 'Khách hàng', 'Phí BH (VND)', 'Trạng thái', 'Ngày bán'];
    const rows = data.map((d: any) => [
      d.policy_number, d.product_name, d.insurance_type, d.insurer_name,
      d.customer_name, d.premium_amount, d.status,
      new Date(d.sale_date).toLocaleDateString('vi-VN'),
    ]);

    return this.buildCSV(headers, rows);
  }

  private async generateFinancialCSV(request: ExportRequest): Promise<string> {
    const startDate = request.date_range?.start_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = request.date_range?.end_date || new Date().toISOString();

    const data = await AppDataSource.query(`
      SELECT TO_CHAR(paid_at, 'YYYY-MM') as month,
             COUNT(*) as transactions,
             SUM(amount) as revenue,
             payment_method
      FROM payment WHERE status = 'paid' AND paid_at BETWEEN $1 AND $2
      GROUP BY TO_CHAR(paid_at, 'YYYY-MM'), payment_method
      ORDER BY month, payment_method
    `, [startDate, endDate]);

    const headers = ['Tháng', 'Phương thức TT', 'Số giao dịch', 'Doanh thu (VND)'];
    const rows = data.map((d: any) => [d.month, d.payment_method, d.transactions, d.revenue]);

    return this.buildCSV(headers, rows);
  }

  private async generateCustomerCSV(request: ExportRequest): Promise<string> {
    const data = await AppDataSource.query(`
      SELECT c.id, c.full_name, c.email, c.phone, c.gender,
             c.date_of_birth, c.city, c.created_at,
             COUNT(p.id) as policies_count,
             COALESCE(SUM(p.premium_amount), 0) as total_premium
      FROM customer c
      LEFT JOIN policy p ON p.customer_id = c.id
      GROUP BY c.id, c.full_name, c.email, c.phone, c.gender, c.date_of_birth, c.city, c.created_at
      ORDER BY total_premium DESC
      LIMIT 10000
    `);

    const headers = ['ID', 'Họ tên', 'Email', 'SĐT', 'Giới tính', 'Ngày sinh', 'Thành phố', 'Ngày đăng ký', 'Số HĐ', 'Tổng phí BH (VND)'];
    const rows = data.map((d: any) => [
      d.id, d.full_name, d.email, d.phone, d.gender,
      d.date_of_birth ? new Date(d.date_of_birth).toLocaleDateString('vi-VN') : '',
      d.city, new Date(d.created_at).toLocaleDateString('vi-VN'),
      d.policies_count, d.total_premium,
    ]);

    return this.buildCSV(headers, rows);
  }

  private async generateProductCSV(request: ExportRequest): Promise<string> {
    const data = await AppDataSource.query(`
      SELECT pr.name as product_name, pr.insurance_type,
             COALESCE(i.name, 'N/A') as insurer_name, pr.status,
             COUNT(p.id) as policies_sold,
             COALESCE(SUM(p.premium_amount), 0) as total_revenue,
             COALESCE(AVG(p.premium_amount), 0) as avg_premium
      FROM product pr
      LEFT JOIN policy p ON p.product_id = pr.id
      LEFT JOIN insurer i ON pr.insurer_id = i.id
      GROUP BY pr.name, pr.insurance_type, i.name, pr.status
      ORDER BY total_revenue DESC
    `);

    const headers = ['Sản phẩm', 'Loại BH', 'Nhà BH', 'Trạng thái', 'Số HĐ bán', 'Tổng doanh thu (VND)', 'Phí TB (VND)'];
    const rows = data.map((d: any) => [
      d.product_name, d.insurance_type, d.insurer_name, d.status,
      d.policies_sold, d.total_revenue, Math.round(parseFloat(d.avg_premium)),
    ]);

    return this.buildCSV(headers, rows);
  }

  private async generateClaimsCSV(request: ExportRequest): Promise<string> {
    const startDate = request.date_range?.start_date || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = request.date_range?.end_date || new Date().toISOString();

    const data = await AppDataSource.query(`
      SELECT cl.claim_number, p.policy_number, pr.name as product_name,
             c.full_name as customer_name, cl.claim_amount, cl.approved_amount,
             cl.status, cl.created_at as submitted_date, cl.updated_at
      FROM claim cl
      JOIN policy p ON cl.policy_id = p.id
      JOIN product pr ON p.product_id = pr.id
      JOIN customer c ON cl.customer_id = c.id
      WHERE cl.created_at BETWEEN $1 AND $2
      ORDER BY cl.created_at DESC
    `, [startDate, endDate]);

    const headers = ['Mã yêu cầu', 'Mã HĐ', 'Sản phẩm', 'Khách hàng', 'Số tiền yêu cầu', 'Số tiền duyệt', 'Trạng thái', 'Ngày nộp', 'Cập nhật'];
    const rows = data.map((d: any) => [
      d.claim_number, d.policy_number, d.product_name, d.customer_name,
      d.claim_amount, d.approved_amount || '', d.status,
      new Date(d.submitted_date).toLocaleDateString('vi-VN'),
      new Date(d.updated_at).toLocaleDateString('vi-VN'),
    ]);

    return this.buildCSV(headers, rows);
  }

  private async generateCommissionCSV(request: ExportRequest): Promise<string> {
    const startDate = request.date_range?.start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = request.date_range?.end_date || new Date().toISOString();

    const data = await AppDataSource.query(`
      SELECT i.name as insurer_name, pr.insurance_type,
             p.policy_number, p.premium_amount,
             COALESCE(pc.commission_rate, 0.1) as commission_rate,
             p.premium_amount * COALESCE(pc.commission_rate, 0.1) as commission_amount,
             p.created_at as issue_date
      FROM policy p
      JOIN insurer i ON p.insurer_id = i.id
      JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = p.insurer_id AND pc.insurance_type = pr.insurance_type
      WHERE p.created_at BETWEEN $1 AND $2
      ORDER BY p.created_at DESC
    `, [startDate, endDate]);

    const headers = ['Nhà BH', 'Loại BH', 'Mã HĐ', 'Phí BH (VND)', 'Tỷ lệ HH (%)', 'Hoa hồng (VND)', 'Ngày phát hành'];
    const rows = data.map((d: any) => [
      d.insurer_name, d.insurance_type, d.policy_number,
      d.premium_amount, Math.round(parseFloat(d.commission_rate) * 100),
      Math.round(parseFloat(d.commission_amount)),
      new Date(d.issue_date).toLocaleDateString('vi-VN'),
    ]);

    return this.buildCSV(headers, rows);
  }

  private async generatePoliciesCSV(request: ExportRequest): Promise<string> {
    const startDate = request.date_range?.start_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = request.date_range?.end_date || new Date().toISOString();

    const data = await AppDataSource.query(`
      SELECT p.policy_number, pr.name as product_name, pr.insurance_type,
             i.name as insurer_name, c.full_name as customer_name, c.email,
             p.premium_amount, p.status, p.start_date, p.end_date, p.created_at
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      LEFT JOIN insurer i ON p.insurer_id = i.id
      JOIN customer c ON p.customer_id = c.id
      WHERE p.created_at BETWEEN $1 AND $2
      ORDER BY p.created_at DESC
      LIMIT 50000
    `, [startDate, endDate]);

    const headers = ['Mã HĐ', 'Sản phẩm', 'Loại BH', 'Nhà BH', 'Khách hàng', 'Email', 'Phí BH', 'Trạng thái', 'Bắt đầu', 'Kết thúc', 'Ngày tạo'];
    const rows = data.map((d: any) => [
      d.policy_number, d.product_name, d.insurance_type, d.insurer_name,
      d.customer_name, d.email, d.premium_amount, d.status,
      d.start_date ? new Date(d.start_date).toLocaleDateString('vi-VN') : '',
      d.end_date ? new Date(d.end_date).toLocaleDateString('vi-VN') : '',
      new Date(d.created_at).toLocaleDateString('vi-VN'),
    ]);

    return this.buildCSV(headers, rows);
  }

  // ============ PDF Generation ============

  private async generatePDF(request: ExportRequest): Promise<string> {
    // Generate HTML-based PDF content
    const htmlContent = await this.generatePDFHTML(request);
    // In production, use puppeteer or wkhtmltopdf to convert HTML to PDF
    // For now, return the HTML as base64 (can be rendered client-side)
    return Buffer.from(htmlContent).toString('base64');
  }

  private async generatePDFHTML(request: ExportRequest): Promise<string> {
    const startDate = request.date_range?.start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = request.date_range?.end_date || new Date().toISOString();

    let title = '';
    let tableHTML = '';

    switch (request.report_type) {
      case 'sales':
        title = 'Báo cáo Doanh số';
        tableHTML = await this.generateSalesPDFTable(startDate, endDate);
        break;
      case 'financial':
        title = 'Báo cáo Tài chính';
        tableHTML = await this.generateFinancialPDFTable(startDate, endDate);
        break;
      case 'commission':
        title = 'Báo cáo Hoa hồng';
        tableHTML = await this.generateCommissionPDFTable(startDate, endDate);
        break;
      case 'claims':
        title = 'Báo cáo Bồi thường';
        tableHTML = await this.generateClaimsPDFTable(startDate, endDate);
        break;
      default:
        title = `Báo cáo ${request.report_type}`;
        tableHTML = '<p>Không có dữ liệu</p>';
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Arial', sans-serif; margin: 40px; color: #333; }
    h1 { color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
    th { background-color: #1a56db; color: white; padding: 8px 6px; text-align: left; }
    td { padding: 6px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    .summary { background: #f0f4ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .summary h3 { margin-top: 0; color: #1a56db; }
    .footer { margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <p>Kỳ báo cáo: ${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}</p>
    <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</p>
  </div>
  ${tableHTML}
  <div class="footer">
    <p>Insurance System - Báo cáo tự động | Confidential</p>
  </div>
</body>
</html>`;
  }

  private async generateSalesPDFTable(startDate: string, endDate: string): Promise<string> {
    const summary = await AppDataSource.query(`
      SELECT COUNT(*) as total_policies, COALESCE(SUM(premium_amount), 0) as total_revenue,
             COALESCE(AVG(premium_amount), 0) as avg_premium
      FROM policy WHERE created_at BETWEEN $1 AND $2
    `, [startDate, endDate]);

    const s = summary[0];
    return `
      <div class="summary">
        <h3>Tổng quan</h3>
        <p>Tổng số HĐ: <strong>${parseInt(s.total_policies).toLocaleString('vi-VN')}</strong> | 
           Tổng doanh thu: <strong>${(parseFloat(s.total_revenue) / 1000000).toFixed(1)} triệu VND</strong> | 
           Phí TB: <strong>${(parseFloat(s.avg_premium) / 1000000).toFixed(2)} triệu VND</strong></p>
      </div>`;
  }

  private async generateFinancialPDFTable(startDate: string, endDate: string): Promise<string> {
    const data = await AppDataSource.query(`
      SELECT TO_CHAR(paid_at, 'YYYY-MM') as month, SUM(amount) as revenue, COUNT(*) as txns
      FROM payment WHERE status = 'paid' AND paid_at BETWEEN $1 AND $2
      GROUP BY TO_CHAR(paid_at, 'YYYY-MM') ORDER BY month
    `, [startDate, endDate]);

    let rows = data.map((d: any) =>
      `<tr><td>${d.month}</td><td>${parseInt(d.txns).toLocaleString('vi-VN')}</td><td>${(parseFloat(d.revenue) / 1000000).toFixed(1)} triệu</td></tr>`
    ).join('');

    return `<table><tr><th>Tháng</th><th>Số GD</th><th>Doanh thu</th></tr>${rows}</table>`;
  }

  private async generateCommissionPDFTable(startDate: string, endDate: string): Promise<string> {
    const data = await AppDataSource.query(`
      SELECT i.name as insurer_name, COUNT(p.id) as policies,
             COALESCE(SUM(p.premium_amount), 0) as premium,
             COALESCE(SUM(p.premium_amount * COALESCE(pc.commission_rate, 0.1)), 0) as commission
      FROM policy p
      JOIN insurer i ON p.insurer_id = i.id
      JOIN product pr ON p.product_id = pr.id
      LEFT JOIN partner_commission pc ON pc.insurer_id = i.id AND pc.insurance_type = pr.insurance_type
      WHERE p.created_at BETWEEN $1 AND $2
      GROUP BY i.name ORDER BY commission DESC
    `, [startDate, endDate]);

    let rows = data.map((d: any) =>
      `<tr><td>${d.insurer_name}</td><td>${d.policies}</td><td>${(parseFloat(d.premium) / 1000000).toFixed(1)} triệu</td><td>${(parseFloat(d.commission) / 1000000).toFixed(1)} triệu</td></tr>`
    ).join('');

    return `<table><tr><th>Nhà BH</th><th>Số HĐ</th><th>Phí BH</th><th>Hoa hồng</th></tr>${rows}</table>`;
  }

  private async generateClaimsPDFTable(startDate: string, endDate: string): Promise<string> {
    const summary = await AppDataSource.query(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(claim_amount), 0) as total_amount
      FROM claim WHERE created_at BETWEEN $1 AND $2
      GROUP BY status
    `, [startDate, endDate]);

    let rows = summary.map((d: any) =>
      `<tr><td>${d.status}</td><td>${d.count}</td><td>${(parseFloat(d.total_amount) / 1000000).toFixed(1)} triệu</td></tr>`
    ).join('');

    return `<table><tr><th>Trạng thái</th><th>Số lượng</th><th>Tổng tiền</th></tr>${rows}</table>`;
  }

  // ============ Utilities ============

  private buildCSV(headers: string[], rows: any[][]): string {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const headerLine = headers.map(h => this.escapeCSV(h)).join(',');
    const dataLines = rows.map(row =>
      row.map(cell => this.escapeCSV(String(cell ?? ''))).join(',')
    );
    return BOM + [headerLine, ...dataLines].join('\n');
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
