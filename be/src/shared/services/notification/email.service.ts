import { logger } from '../../utils/logger';
import { getNotificationConfig, EmailConfig } from './notification.config';
import { withRetry } from './retry';

export interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, string>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

/**
 * Email provider interface for different implementations
 */
export interface IEmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
  getName(): string;
}

/**
 * SendGrid email provider implementation
 */
export class SendGridProvider implements IEmailProvider {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor(config: EmailConfig) {
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
  }

  getName(): string {
    return 'sendgrid';
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const payload: any = {
      personalizations: [
        {
          to: [{ email: message.to }],
          ...(message.templateData && { dynamic_template_data: message.templateData }),
        },
      ],
      from: { email: this.fromEmail, name: this.fromName },
      subject: message.subject,
    };

    if (message.templateId) {
      payload.template_id = message.templateId;
    } else {
      payload.content = [
        ...(message.text ? [{ type: 'text/plain', value: message.text }] : []),
        ...(message.html ? [{ type: 'text/html', value: message.html }] : []),
      ];
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`SendGrid error (${response.status}): ${errorBody}`);
    }

    const messageId = response.headers.get('x-message-id') || 'unknown';
    return {
      success: true,
      messageId,
      provider: 'sendgrid',
    };
  }
}

/**
 * AWS SES email provider implementation
 */
export class SESProvider implements IEmailProvider {
  constructor(private _config: EmailConfig) {}

  getName(): string {
    return 'ses';
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    // AWS SES implementation using AWS SDK
    // In production, use @aws-sdk/client-ses
    logger.info(`[SES] Would send email to ${message.to}: ${message.subject}`);
    throw new Error('SES provider not yet implemented. Use SendGrid or mock.');
  }
}

/**
 * Mock email provider for development/testing
 */
export class MockEmailProvider implements IEmailProvider {
  private sentEmails: EmailMessage[] = [];

  getName(): string {
    return 'mock';
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.sentEmails.push(message);
    logger.info(`[MockEmail] Sent to ${message.to}: ${message.subject}`);
    if (message.templateData) {
      logger.info(`[MockEmail] Template data: ${JSON.stringify(message.templateData)}`);
    }
    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      provider: 'mock',
    };
  }

  getSentEmails(): EmailMessage[] {
    return [...this.sentEmails];
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }

  getLastEmail(): EmailMessage | undefined {
    return this.sentEmails[this.sentEmails.length - 1];
  }
}

/**
 * Main Email Service with retry logic and provider abstraction
 */
export class EmailService {
  private provider: IEmailProvider;
  private config = getNotificationConfig();

  constructor(providerOverride?: IEmailProvider) {
    if (providerOverride) {
      this.provider = providerOverride;
    } else {
      this.provider = this.createProvider();
    }
    logger.info(`[EmailService] Initialized with provider: ${this.provider.getName()}`);
  }

  private createProvider(): IEmailProvider {
    switch (this.config.email.provider) {
      case 'sendgrid':
        return new SendGridProvider(this.config.email);
      case 'ses':
        return new SESProvider(this.config.email);
      case 'mock':
      default:
        return new MockEmailProvider();
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOtpEmail(to: string, otp: string, expiresInMinutes: number = 5): Promise<EmailSendResult> {
    const message: EmailMessage = {
      to,
      subject: `[Insurance System] Mã xác thực OTP: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a73e8;">Xác thực tài khoản</h2>
          <p>Mã OTP của bạn là:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a73e8;">${otp}</span>
          </div>
          <p>Mã này sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>.</p>
          <p style="color: #666;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Insurance System - Không chia sẻ mã OTP với bất kỳ ai.</p>
        </div>
      `,
      text: `Mã OTP của bạn là: ${otp}. Hết hạn sau ${expiresInMinutes} phút. Không chia sẻ mã này.`,
      templateData: { otp, minutes: String(expiresInMinutes) },
    };

    return this.sendWithRetry(message, 'sendOtpEmail');
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, otp: string, expiresInMinutes: number = 5): Promise<EmailSendResult> {
    const message: EmailMessage = {
      to,
      subject: '[Insurance System] Đặt lại mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d93025;">Đặt lại mật khẩu</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã sau:</p>
          <div style="background: #fef7f7; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #d93025;">${otp}</span>
          </div>
          <p>Mã này sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>.</p>
          <p style="color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này và đảm bảo tài khoản của bạn an toàn.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Insurance System - Bảo mật tài khoản của bạn là ưu tiên hàng đầu.</p>
        </div>
      `,
      text: `Mã đặt lại mật khẩu: ${otp}. Hết hạn sau ${expiresInMinutes} phút.`,
      templateData: { otp, minutes: String(expiresInMinutes) },
    };

    return this.sendWithRetry(message, 'sendPasswordResetEmail');
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(to: string, fullName: string): Promise<EmailSendResult> {
    const message: EmailMessage = {
      to,
      subject: '[Insurance System] Chào mừng bạn!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a73e8;">Chào mừng ${fullName}!</h2>
          <p>Tài khoản của bạn đã được xác thực thành công.</p>
          <p>Bạn có thể bắt đầu khám phá các sản phẩm bảo hiểm phù hợp ngay bây giờ.</p>
          <a href="https://insurance-system.vn/products" 
             style="display: inline-block; background: #1a73e8; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0;">
            Xem sản phẩm
          </a>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Insurance System</p>
        </div>
      `,
      text: `Chào mừng ${fullName}! Tài khoản của bạn đã được xác thực thành công.`,
      templateData: { full_name: fullName },
    };

    return this.sendWithRetry(message, 'sendWelcomeEmail');
  }

  /**
   * Send generic email with retry
   */
  async send(message: EmailMessage): Promise<EmailSendResult> {
    return this.sendWithRetry(message, 'sendEmail');
  }

  private async sendWithRetry(message: EmailMessage, context: string): Promise<EmailSendResult> {
    const result = await withRetry(
      () => this.provider.send(message),
      this.config.retry,
      `${context}:${message.to}`,
    );

    if (result.success && result.result) {
      return result.result;
    }

    return {
      success: false,
      provider: this.provider.getName(),
      error: result.error?.message || 'Unknown error after retries',
    };
  }

  /**
   * Get the underlying provider (useful for testing)
   */
  getProvider(): IEmailProvider {
    return this.provider;
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

export function resetEmailService(): void {
  emailServiceInstance = null;
}
