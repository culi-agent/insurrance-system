/**
 * Notification Service - Handles email, SMS, and in-app notifications
 * 
 * In production: integrate with SendGrid/SES for email, Twilio for SMS
 * Currently: logs notifications (mock implementation)
 */

import { logger } from '../../../shared/utils/logger';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SmsPayload {
  to: string;
  message: string;
}

export class NotificationService {
  /**
   * Send registration welcome email
   */
  static async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    const payload: EmailPayload = {
      to: email,
      subject: 'Chào mừng bạn đến với Insurance System!',
      html: EmailTemplates.welcome(fullName),
    };
    await this.sendEmail(payload);
  }

  /**
   * Send quote confirmation email
   */
  static async sendQuoteEmail(email: string, data: {
    fullName: string;
    productType: string;
    quoteCount: number;
    lowestPremium: number;
    validUntil: string;
  }): Promise<void> {
    const payload: EmailPayload = {
      to: email,
      subject: `Báo giá bảo hiểm ${data.productType} của bạn đã sẵn sàng`,
      html: EmailTemplates.quoteReady(data),
    };
    await this.sendEmail(payload);
  }

  /**
   * Send policy confirmation email
   */
  static async sendPolicyConfirmation(email: string, data: {
    fullName: string;
    policyNumber: string;
    productType: string;
    insurerName: string;
    premiumAnnual: number;
    startDate: string;
    endDate: string;
    documentUrl?: string;
  }): Promise<void> {
    const payload: EmailPayload = {
      to: email,
      subject: `Xác nhận hợp đồng bảo hiểm ${data.policyNumber}`,
      html: EmailTemplates.policyConfirmation(data),
    };
    await this.sendEmail(payload);
  }

  /**
   * Send payment receipt email
   */
  static async sendPaymentReceipt(email: string, data: {
    fullName: string;
    policyNumber: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    paidAt: string;
  }): Promise<void> {
    const payload: EmailPayload = {
      to: email,
      subject: `Biên lai thanh toán - ${data.policyNumber}`,
      html: EmailTemplates.paymentReceipt(data),
    };
    await this.sendEmail(payload);
  }

  /**
   * Send policy expiry reminder
   */
  static async sendExpiryReminder(email: string, data: {
    fullName: string;
    policyNumber: string;
    expiryDate: string;
    daysRemaining: number;
  }): Promise<void> {
    const payload: EmailPayload = {
      to: email,
      subject: `Hợp đồng ${data.policyNumber} sắp hết hạn - còn ${data.daysRemaining} ngày`,
      html: EmailTemplates.expiryReminder(data),
    };
    await this.sendEmail(payload);
  }

  /**
   * Send cancellation confirmation
   */
  static async sendCancellationConfirmation(email: string, data: {
    fullName: string;
    policyNumber: string;
    refundAmount: number;
    refundDays: number;
  }): Promise<void> {
    const payload: EmailPayload = {
      to: email,
      subject: `Xác nhận hủy hợp đồng ${data.policyNumber}`,
      html: EmailTemplates.cancellationConfirmation(data),
    };
    await this.sendEmail(payload);
  }

  // --- Transport methods (mock) ---

  private static async sendEmail(payload: EmailPayload): Promise<void> {
    // In production: use SendGrid, AWS SES, or similar
    logger.info(`[Email] To: ${payload.to} | Subject: ${payload.subject}`);
    logger.debug(`[Email] Body length: ${payload.html.length} chars`);
  }

  static async sendSms(payload: SmsPayload): Promise<void> {
    // In production: use Twilio, AWS SNS, or similar
    logger.info(`[SMS] To: ${payload.to} | Message: ${payload.message.substring(0, 50)}...`);
  }
}

/**
 * Email HTML Templates
 */
class EmailTemplates {
  private static baseStyle = `
    font-family: 'Segoe UI', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #f9fafb;
  `;

  static welcome(fullName: string): string {
    return `
      <div style="${this.baseStyle}">
        <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #1e40af; margin-bottom: 16px;">Chào mừng ${fullName}!</h1>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Insurance System.</p>
          <p>Bạn có thể bắt đầu:</p>
          <ul>
            <li>So sánh sản phẩm bảo hiểm từ nhiều công ty</li>
            <li>Nhận báo giá miễn phí trong vài giây</li>
            <li>Mua bảo hiểm 100% trực tuyến</li>
          </ul>
          <a href="https://insurance-system.vn/products" 
             style="display: inline-block; background: #1e40af; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
            Khám phá sản phẩm
          </a>
        </div>
      </div>
    `;
  }

  static quoteReady(data: {
    fullName: string;
    productType: string;
    quoteCount: number;
    lowestPremium: number;
    validUntil: string;
  }): string {
    const productLabels: Record<string, string> = {
      motor: 'Xe cơ giới',
      health: 'Sức khỏe',
      travel: 'Du lịch',
      life: 'Nhân thọ',
    };
    return `
      <div style="${this.baseStyle}">
        <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #1e40af;">Báo giá đã sẵn sàng!</h1>
          <p>Xin chào ${data.fullName},</p>
          <p>Chúng tôi đã tìm được <strong>${data.quoteCount} báo giá</strong> bảo hiểm 
             <strong>${productLabels[data.productType] || data.productType}</strong> cho bạn.</p>
          <div style="background: #eff6ff; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 18px;">
              Giá từ: <strong>${data.lowestPremium.toLocaleString('vi-VN')} VND/năm</strong>
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Báo giá có hiệu lực đến: ${new Date(data.validUntil).toLocaleDateString('vi-VN')}
          </p>
          <a href="https://insurance-system.vn/quotes" 
             style="display: inline-block; background: #1e40af; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Xem báo giá
          </a>
        </div>
      </div>
    `;
  }

  static policyConfirmation(data: {
    fullName: string;
    policyNumber: string;
    productType: string;
    insurerName: string;
    premiumAnnual: number;
    startDate: string;
    endDate: string;
    documentUrl?: string;
  }): string {
    return `
      <div style="${this.baseStyle}">
        <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">✅</span>
          </div>
          <h1 style="color: #059669; text-align: center;">Hợp đồng đã được kích hoạt!</h1>
          <p>Xin chào ${data.fullName},</p>
          <p>Hợp đồng bảo hiểm của bạn đã được xác nhận thành công.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #6b7280;">Số hợp đồng:</td><td style="padding: 8px; font-weight: bold;">${data.policyNumber}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Công ty BH:</td><td style="padding: 8px;">${data.insurerName}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Phí BH/năm:</td><td style="padding: 8px;">${data.premiumAnnual.toLocaleString('vi-VN')} VND</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Hiệu lực:</td><td style="padding: 8px;">${data.startDate} - ${data.endDate}</td></tr>
          </table>
          ${data.documentUrl ? `<a href="${data.documentUrl}" style="display: inline-block; background: #1e40af; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Tải hợp đồng PDF</a>` : ''}
        </div>
      </div>
    `;
  }

  static paymentReceipt(data: {
    fullName: string;
    policyNumber: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    paidAt: string;
  }): string {
    return `
      <div style="${this.baseStyle}">
        <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #1e40af;">Biên lai thanh toán</h1>
          <p>Xin chào ${data.fullName},</p>
          <p>Thanh toán của bạn đã được xử lý thành công.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px; color: #6b7280;">Số tiền:</td><td style="padding: 6px; font-weight: bold; color: #059669;">${data.amount.toLocaleString('vi-VN')} VND</td></tr>
              <tr><td style="padding: 6px; color: #6b7280;">Phương thức:</td><td style="padding: 6px;">${data.paymentMethod}</td></tr>
              <tr><td style="padding: 6px; color: #6b7280;">Mã GD:</td><td style="padding: 6px;">${data.transactionId}</td></tr>
              <tr><td style="padding: 6px; color: #6b7280;">Thời gian:</td><td style="padding: 6px;">${data.paidAt}</td></tr>
              <tr><td style="padding: 6px; color: #6b7280;">Hợp đồng:</td><td style="padding: 6px;">${data.policyNumber}</td></tr>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  static expiryReminder(data: {
    fullName: string;
    policyNumber: string;
    expiryDate: string;
    daysRemaining: number;
  }): string {
    return `
      <div style="${this.baseStyle}">
        <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #d97706;">⚠️ Hợp đồng sắp hết hạn</h1>
          <p>Xin chào ${data.fullName},</p>
          <p>Hợp đồng <strong>${data.policyNumber}</strong> sẽ hết hạn vào 
             <strong>${data.expiryDate}</strong> (còn ${data.daysRemaining} ngày).</p>
          <p>Gia hạn ngay để đảm bảo quyền lợi bảo hiểm không bị gián đoạn.</p>
          <a href="https://insurance-system.vn/policies/${data.policyNumber}/renew" 
             style="display: inline-block; background: #d97706; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Gia hạn ngay
          </a>
        </div>
      </div>
    `;
  }

  static cancellationConfirmation(data: {
    fullName: string;
    policyNumber: string;
    refundAmount: number;
    refundDays: number;
  }): string {
    return `
      <div style="${this.baseStyle}">
        <div style="background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #dc2626;">Hợp đồng đã được hủy</h1>
          <p>Xin chào ${data.fullName},</p>
          <p>Hợp đồng <strong>${data.policyNumber}</strong> đã được hủy thành công.</p>
          ${data.refundAmount > 0 ? `
            <div style="background: #fef3c7; border-radius: 6px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Hoàn tiền:</strong> ${data.refundAmount.toLocaleString('vi-VN')} VND</p>
              <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
                Dự kiến nhận trong ${data.refundDays} ngày làm việc
              </p>
            </div>
          ` : ''}
          <p style="color: #6b7280;">Nếu bạn cần hỗ trợ, vui lòng liên hệ hotline: 1900-xxxx</p>
        </div>
      </div>
    `;
  }
}
