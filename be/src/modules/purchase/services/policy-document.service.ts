/**
 * Policy Document Generation Service
 * Generates PDF policy documents and certificates
 */

export interface PolicyDocumentInput {
  policy_number: string;
  insurance_type: string;
  plan_name: string;
  insurer_name: string;
  insured_info: {
    full_name: string;
    id_number: string;
    date_of_birth: string;
    address: string;
    phone: string;
    email: string;
  };
  beneficiary_info?: Array<{
    full_name: string;
    relationship: string;
    id_number: string;
    percentage: number;
  }>;
  coverage_details: {
    type: string;
    sum_insured: number;
    deductible?: number;
    coverage_items: Array<{
      name: string;
      limit: number;
      description?: string;
    }>;
  };
  premium: {
    base: number;
    discount: number;
    tax: number;
    total: number;
    payment_frequency: string;
  };
  dates: {
    effective_date: string;
    expiry_date: string;
    issued_date: string;
  };
}

export interface GeneratedDocument {
  document_url: string;
  document_type: 'policy' | 'certificate';
  file_name: string;
  file_size: number;
  generated_at: string;
}

export class PolicyDocumentService {
  private static readonly DOCUMENT_BASE_PATH = '/documents/policies';

  /**
   * Generate policy document (PDF)
   * In production, this would use a PDF library like PDFKit or Puppeteer
   */
  static async generatePolicyDocument(input: PolicyDocumentInput): Promise<GeneratedDocument> {
    const fileName = `policy_${input.policy_number}_${Date.now()}.pdf`;
    const documentUrl = `${this.DOCUMENT_BASE_PATH}/${fileName}`;

    // Generate the HTML content for the policy document
    const htmlContent = this.generatePolicyHTML(input);

    // In production: convert HTML to PDF using Puppeteer/PDFKit
    // For now, return the document reference
    const estimatedSize = Buffer.byteLength(htmlContent, 'utf8');

    return {
      document_url: documentUrl,
      document_type: 'policy',
      file_name: fileName,
      file_size: estimatedSize,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Generate insurance certificate (shorter version)
   */
  static async generateCertificate(input: PolicyDocumentInput): Promise<GeneratedDocument> {
    const fileName = `certificate_${input.policy_number}_${Date.now()}.pdf`;
    const documentUrl = `${this.DOCUMENT_BASE_PATH}/${fileName}`;

    const htmlContent = this.generateCertificateHTML(input);
    const estimatedSize = Buffer.byteLength(htmlContent, 'utf8');

    return {
      document_url: documentUrl,
      document_type: 'certificate',
      file_name: fileName,
      file_size: estimatedSize,
      generated_at: new Date().toISOString(),
    };
  }

  private static generatePolicyHTML(input: PolicyDocumentInput): string {
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hợp Đồng Bảo Hiểm - ${input.policy_number}</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a365d; margin: 0; }
    .header h2 { color: #2d3748; margin: 5px 0; }
    .section { margin: 20px 0; }
    .section h3 { color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    table th, table td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    table th { background: #f7fafc; font-weight: bold; }
    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #718096; }
    .signature-area { margin-top: 80px; display: flex; justify-content: space-between; }
    .signature-box { text-align: center; width: 40%; }
    .amount { font-weight: bold; color: #e53e3e; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${input.insurer_name}</h1>
    <h2>HỢP ĐỒNG BẢO HIỂM</h2>
    <p><strong>Số hợp đồng:</strong> ${input.policy_number}</p>
    <p><strong>Loại bảo hiểm:</strong> ${this.getInsuranceTypeName(input.insurance_type)}</p>
  </div>

  <div class="section">
    <h3>I. THÔNG TIN NGƯỜI ĐƯỢC BẢO HIỂM</h3>
    <table>
      <tr><th>Họ và tên</th><td>${input.insured_info.full_name}</td></tr>
      <tr><th>Số CCCD/CMND</th><td>${input.insured_info.id_number}</td></tr>
      <tr><th>Ngày sinh</th><td>${input.insured_info.date_of_birth}</td></tr>
      <tr><th>Địa chỉ</th><td>${input.insured_info.address}</td></tr>
      <tr><th>Điện thoại</th><td>${input.insured_info.phone}</td></tr>
      <tr><th>Email</th><td>${input.insured_info.email}</td></tr>
    </table>
  </div>

  ${input.beneficiary_info && input.beneficiary_info.length > 0 ? `
  <div class="section">
    <h3>II. NGƯỜI THỤ HƯỞNG</h3>
    <table>
      <tr><th>Họ tên</th><th>Quan hệ</th><th>CCCD/CMND</th><th>Tỷ lệ (%)</th></tr>
      ${input.beneficiary_info.map(b => `
        <tr>
          <td>${b.full_name}</td>
          <td>${b.relationship}</td>
          <td>${b.id_number}</td>
          <td>${b.percentage}%</td>
        </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}

  <div class="section">
    <h3>III. PHẠM VI BẢO HIỂM</h3>
    <table>
      <tr><th>Loại quyền lợi</th><th>Mức bảo hiểm</th><th>Mô tả</th></tr>
      ${input.coverage_details.coverage_items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${formatCurrency(item.limit)}</td>
          <td>${item.description || ''}</td>
        </tr>
      `).join('')}
    </table>
    <p><strong>Tổng mức bảo hiểm:</strong> <span class="amount">${formatCurrency(input.coverage_details.sum_insured)}</span></p>
  </div>

  <div class="section">
    <h3>IV. PHÍ BẢO HIỂM</h3>
    <table>
      <tr><th>Phí cơ bản</th><td>${formatCurrency(input.premium.base)}</td></tr>
      <tr><th>Giảm giá</th><td>-${formatCurrency(input.premium.discount)}</td></tr>
      <tr><th>Thuế VAT</th><td>${formatCurrency(input.premium.tax)}</td></tr>
      <tr><th><strong>Tổng phí</strong></th><td class="amount">${formatCurrency(input.premium.total)}</td></tr>
      <tr><th>Kỳ thanh toán</th><td>${this.getPaymentFrequencyName(input.premium.payment_frequency)}</td></tr>
    </table>
  </div>

  <div class="section">
    <h3>V. THỜI HẠN BẢO HIỂM</h3>
    <table>
      <tr><th>Ngày hiệu lực</th><td>${input.dates.effective_date}</td></tr>
      <tr><th>Ngày hết hạn</th><td>${input.dates.expiry_date}</td></tr>
      <tr><th>Ngày cấp</th><td>${input.dates.issued_date}</td></tr>
    </table>
  </div>

  <div class="signature-area">
    <div class="signature-box">
      <p><strong>BÊN BẢO HIỂM</strong></p>
      <p>${input.insurer_name}</p>
      <br/><br/><br/>
      <p>___________________</p>
      <p>Đại diện ký tên</p>
    </div>
    <div class="signature-box">
      <p><strong>BÊN MUA BẢO HIỂM</strong></p>
      <p>${input.insured_info.full_name}</p>
      <br/><br/><br/>
      <p>___________________</p>
      <p>Ký tên</p>
    </div>
  </div>

  <div class="footer">
    <p>Tài liệu này được tạo tự động bởi Hệ Thống Bảo Hiểm Trực Tuyến</p>
    <p>Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}</p>
  </div>
</body>
</html>`;
  }

  private static generateCertificateHTML(input: PolicyDocumentInput): string {
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Giấy Chứng Nhận Bảo Hiểm - ${input.policy_number}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
    .certificate { border: 3px double #1a365d; padding: 40px; }
    h1 { color: #1a365d; }
    .details { text-align: left; margin: 30px auto; max-width: 600px; }
    .details p { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="certificate">
    <h1>GIẤY CHỨNG NHẬN BẢO HIỂM</h1>
    <h2>${input.insurer_name}</h2>
    <p><strong>Số: ${input.policy_number}</strong></p>
    
    <div class="details">
      <p><strong>Người được bảo hiểm:</strong> ${input.insured_info.full_name}</p>
      <p><strong>Số CCCD:</strong> ${input.insured_info.id_number}</p>
      <p><strong>Loại bảo hiểm:</strong> ${this.getInsuranceTypeName(input.insurance_type)}</p>
      <p><strong>Gói bảo hiểm:</strong> ${input.plan_name}</p>
      <p><strong>Số tiền bảo hiểm:</strong> ${formatCurrency(input.coverage_details.sum_insured)}</p>
      <p><strong>Hiệu lực từ:</strong> ${input.dates.effective_date} đến ${input.dates.expiry_date}</p>
    </div>
    
    <p style="margin-top: 40px; font-size: 12px; color: #718096;">
      Ngày cấp: ${input.dates.issued_date}
    </p>
  </div>
</body>
</html>`;
  }

  private static getInsuranceTypeName(type: string): string {
    const names: Record<string, string> = {
      motor: 'Bảo hiểm xe cơ giới',
      health: 'Bảo hiểm sức khỏe',
      travel: 'Bảo hiểm du lịch',
      life: 'Bảo hiểm nhân thọ',
      property: 'Bảo hiểm tài sản',
    };
    return names[type] || type;
  }

  private static getPaymentFrequencyName(frequency: string): string {
    const names: Record<string, string> = {
      one_time: 'Thanh toán một lần',
      monthly: 'Hàng tháng',
      quarterly: 'Hàng quý',
      semi_annual: 'Nửa năm',
      annual: 'Hàng năm',
    };
    return names[frequency] || frequency;
  }
}
