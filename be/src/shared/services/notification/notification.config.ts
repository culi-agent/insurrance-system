import { env } from '../../../config/environment';

export interface EmailConfig {
  provider: 'sendgrid' | 'ses' | 'mailgun' | 'mock';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  templates: {
    otpVerification: string;
    passwordReset: string;
    welcomeEmail: string;
    accountLocked: string;
  };
}

export interface SmsConfig {
  provider: 'twilio' | 'aws-sns' | 'mock';
  accountSid: string;
  authToken: string;
  fromNumber: string;
  templates: {
    otpVerification: string;
    passwordReset: string;
  };
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // ms
  maxDelay: number; // ms
  backoffMultiplier: number;
}

export interface NotificationConfig {
  email: EmailConfig;
  sms: SmsConfig;
  retry: RetryConfig;
}

/**
 * Get notification config from environment variables.
 * Falls back to 'mock' provider in development/test.
 */
export function getNotificationConfig(): NotificationConfig {
  const nodeEnv = env.NODE_ENV;

  return {
    email: {
      provider: (process.env.EMAIL_PROVIDER as EmailConfig['provider']) ||
        (nodeEnv === 'production' ? 'sendgrid' : 'mock'),
      apiKey: process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY || '',
      fromEmail: process.env.EMAIL_FROM || 'noreply@insurance-system.vn',
      fromName: process.env.EMAIL_FROM_NAME || 'Insurance System',
      replyTo: process.env.EMAIL_REPLY_TO || 'support@insurance-system.vn',
      templates: {
        otpVerification: process.env.EMAIL_TEMPLATE_OTP || 'otp-verification',
        passwordReset: process.env.EMAIL_TEMPLATE_RESET || 'password-reset',
        welcomeEmail: process.env.EMAIL_TEMPLATE_WELCOME || 'welcome',
        accountLocked: process.env.EMAIL_TEMPLATE_LOCKED || 'account-locked',
      },
    },
    sms: {
      provider: (process.env.SMS_PROVIDER as SmsConfig['provider']) ||
        (nodeEnv === 'production' ? 'twilio' : 'mock'),
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || process.env.SMS_FROM_NUMBER || '',
      templates: {
        otpVerification: 'Mã OTP của bạn là: {otp}. Hết hạn sau {minutes} phút. Không chia sẻ mã này.',
        passwordReset: 'Mã đặt lại mật khẩu: {otp}. Hết hạn sau {minutes} phút.',
      },
    },
    retry: {
      maxRetries: parseInt(process.env.NOTIFICATION_MAX_RETRIES || '3', 10),
      initialDelay: parseInt(process.env.NOTIFICATION_INITIAL_DELAY || '1000', 10),
      maxDelay: parseInt(process.env.NOTIFICATION_MAX_DELAY || '30000', 10),
      backoffMultiplier: parseFloat(process.env.NOTIFICATION_BACKOFF_MULTIPLIER || '2'),
    },
  };
}
