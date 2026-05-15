/**
 * Notification Service
 * Handles email (SendGrid) and SMS notifications
 */
import { logger } from '../../../shared/utils/logger';

export type NotificationType = 'email' | 'sms' | 'push';
export type NotificationEvent =
  | 'registration_welcome'
  | 'otp_verification'
  | 'password_reset'
  | 'order_created'
  | 'payment_success'
  | 'payment_failed'
  | 'policy_issued'
  | 'policy_renewal_reminder'
  | 'policy_expiring'
  | 'claim_submitted'
  | 'claim_approved'
  | 'claim_rejected';

export interface SendEmailInput {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface SendSmsInput {
  to: string;
  message: string;
}

export interface NotificationPayload {
  event: NotificationEvent;
  recipient: {
    id: string;
    email?: string;
    phone?: string;
    name?: string;
  };
  data: Record<string, any>;
  channels?: NotificationType[];
}

// Email templates
const EMAIL_TEMPLATES: Record<NotificationEvent, { subject: string; template: string }> = {
  registration_welcome: {
    subject: 'Chào mừng bạn đến với Hệ thống Bảo hiểm trực tuyến',
    template: 'welcome',
  },
  otp_verification: {
    subject: 'Mã xác thực OTP của bạn',
    template: 'otp',
  },
  password_reset: {
    subject: 'Đặt lại mật khẩu',
    template: 'password_reset',
  },
  order_created: {
    subject: 'Đơn hàng mới đã được tạo - {{order_number}}',
    template: 'order_created',
  },
  payment_success: {
    subject: 'Thanh toán thành công - {{order_number}}',
    template: 'payment_success',
  },
  payment_failed: {
    subject: 'Thanh toán thất bại - {{order_number}}',
    template: 'payment_failed',
  },
  policy_issued: {
    subject: 'Hợp đồng bảo hiểm đã được phát hành - {{policy_number}}',
    template: 'policy_issued',
  },
  policy_renewal_reminder: {
    subject: 'Nhắc nhở gia hạn bảo hiểm - {{policy_number}}',
    template: 'renewal_reminder',
  },
  policy_expiring: {
    subject: 'Bảo hiểm sắp hết hạn - {{policy_number}}',
    template: 'policy_expiring',
  },
  claim_submitted: {
    subject: 'Yêu cầu bồi thường đã được ghi nhận - {{claim_number}}',
    template: 'claim_submitted',
  },
  claim_approved: {
    subject: 'Yêu cầu bồi thường đã được chấp thuận - {{claim_number}}',
    template: 'claim_approved',
  },
  claim_rejected: {
    subject: 'Yêu cầu bồi thường bị từ chối - {{claim_number}}',
    template: 'claim_rejected',
  },
};

// SMS templates
const SMS_TEMPLATES: Record<string, string> = {
  otp_verification: 'Mã OTP của bạn là: {{otp}}. Có hiệu lực trong {{expiry}} phút.',
  payment_success: 'Thanh toán thành công {{amount}} VND cho đơn {{order_number}}. Chi tiết tại app.',
  policy_issued: 'Hợp đồng BH {{policy_number}} đã phát hành. Kiểm tra email để tải tài liệu.',
  policy_renewal_reminder: 'BH {{policy_number}} sẽ hết hạn vào {{expiry_date}}. Gia hạn ngay tại app.',
  claim_submitted: 'Yêu cầu bồi thường {{claim_number}} đã được tiếp nhận. Theo dõi trạng thái tại app.',
};

export class NotificationService {
  /**
   * Send notification based on event
   */
  static async sendNotification(payload: NotificationPayload): Promise<void> {
    const channels = payload.channels || ['email', 'sms'];

    const promises: Promise<void>[] = [];

    if (channels.includes('email') && payload.recipient.email) {
      promises.push(this.sendEmail(payload));
    }

    if (channels.includes('sms') && payload.recipient.phone) {
      promises.push(this.sendSms(payload));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send email notification via SendGrid
   */
  static async sendEmail(payload: NotificationPayload): Promise<void> {
    const template = EMAIL_TEMPLATES[payload.event];
    if (!template) {
      logger.warn(`[Notification] No email template for event: ${payload.event}`);
      return;
    }

    const subject = this.interpolate(template.subject, payload.data);

    // In production: Use SendGrid API
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to, from, subject, templateId, dynamicTemplateData });

    logger.info(`[Email] Sent to ${payload.recipient.email}: ${subject}`, {
      event: payload.event,
      template: template.template,
      data: payload.data,
    });
  }

  /**
   * Send SMS notification
   */
  static async sendSms(payload: NotificationPayload): Promise<void> {
    const template = SMS_TEMPLATES[payload.event];
    if (!template) {
      logger.warn(`[Notification] No SMS template for event: ${payload.event}`);
      return;
    }

    const message = this.interpolate(template, payload.data);

    // In production: Use Twilio, SpeedSMS, or other Vietnam SMS provider
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({ body: message, from: smsNumber, to: phone });

    logger.info(`[SMS] Sent to ${payload.recipient.phone}: ${message}`, {
      event: payload.event,
    });
  }

  /**
   * Send bulk notifications
   */
  static async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    const batchSize = 10;
    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(p => this.sendNotification(p)));
    }
  }

  /**
   * Interpolate template variables
   */
  private static interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
    });
  }
}
