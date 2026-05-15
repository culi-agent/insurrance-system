import { logger } from '../../utils/logger';
import { getNotificationConfig, SmsConfig } from './notification.config';
import { withRetry } from './retry';

export interface SmsMessage {
  to: string;
  body: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

/**
 * SMS provider interface
 */
export interface ISmsProvider {
  send(message: SmsMessage): Promise<SmsSendResult>;
  getName(): string;
}

/**
 * Twilio SMS provider implementation
 */
export class TwilioProvider implements ISmsProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(config: SmsConfig) {
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.fromNumber = config.fromNumber;
  }

  getName(): string {
    return 'twilio';
  }

  async send(message: SmsMessage): Promise<SmsSendResult> {
    if (!this.accountSid || !this.authToken) {
      throw new Error('Twilio credentials not configured');
    }

    if (!this.fromNumber) {
      throw new Error('Twilio from number not configured');
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    const params = new URLSearchParams();
    params.append('To', message.to);
    params.append('From', this.fromNumber);
    params.append('Body', message.body);

    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Twilio error (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as { sid: string; status: string };
    return {
      success: true,
      messageId: data.sid,
      provider: 'twilio',
    };
  }
}

/**
 * AWS SNS SMS provider implementation
 */
export class AwsSnsProvider implements ISmsProvider {
  constructor(private _config: SmsConfig) {}

  getName(): string {
    return 'aws-sns';
  }

  async send(message: SmsMessage): Promise<SmsSendResult> {
    // AWS SNS implementation - requires @aws-sdk/client-sns
    logger.info(`[AWS SNS] Would send SMS to ${message.to}: ${message.body}`);
    throw new Error('AWS SNS provider not yet implemented. Use Twilio or mock.');
  }
}

/**
 * Mock SMS provider for development/testing
 */
export class MockSmsProvider implements ISmsProvider {
  private sentMessages: SmsMessage[] = [];

  getName(): string {
    return 'mock';
  }

  async send(message: SmsMessage): Promise<SmsSendResult> {
    this.sentMessages.push(message);
    logger.info(`[MockSMS] Sent to ${message.to}: ${message.body}`);
    return {
      success: true,
      messageId: `mock-sms-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      provider: 'mock',
    };
  }

  getSentMessages(): SmsMessage[] {
    return [...this.sentMessages];
  }

  clearSentMessages(): void {
    this.sentMessages = [];
  }

  getLastMessage(): SmsMessage | undefined {
    return this.sentMessages[this.sentMessages.length - 1];
  }
}

/**
 * Main SMS Service with retry logic and provider abstraction
 */
export class SmsService {
  private provider: ISmsProvider;
  private config = getNotificationConfig();

  constructor(providerOverride?: ISmsProvider) {
    if (providerOverride) {
      this.provider = providerOverride;
    } else {
      this.provider = this.createProvider();
    }
    logger.info(`[SmsService] Initialized with provider: ${this.provider.getName()}`);
  }

  private createProvider(): ISmsProvider {
    switch (this.config.sms.provider) {
      case 'twilio':
        return new TwilioProvider(this.config.sms);
      case 'aws-sns':
        return new AwsSnsProvider(this.config.sms);
      case 'mock':
      default:
        return new MockSmsProvider();
    }
  }

  /**
   * Send OTP verification SMS
   */
  async sendOtpSms(to: string, otp: string, expiresInMinutes: number = 5): Promise<SmsSendResult> {
    const body = this.config.sms.templates.otpVerification
      .replace('{otp}', otp)
      .replace('{minutes}', String(expiresInMinutes));

    return this.sendWithRetry({ to, body }, 'sendOtpSms');
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordResetSms(to: string, otp: string, expiresInMinutes: number = 5): Promise<SmsSendResult> {
    const body = this.config.sms.templates.passwordReset
      .replace('{otp}', otp)
      .replace('{minutes}', String(expiresInMinutes));

    return this.sendWithRetry({ to, body }, 'sendPasswordResetSms');
  }

  /**
   * Send generic SMS with retry
   */
  async send(message: SmsMessage): Promise<SmsSendResult> {
    return this.sendWithRetry(message, 'sendSms');
  }

  private async sendWithRetry(message: SmsMessage, context: string): Promise<SmsSendResult> {
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
  getProvider(): ISmsProvider {
    return this.provider;
  }
}

// Singleton instance
let smsServiceInstance: SmsService | null = null;

export function getSmsService(): SmsService {
  if (!smsServiceInstance) {
    smsServiceInstance = new SmsService();
  }
  return smsServiceInstance;
}

export function resetSmsService(): void {
  smsServiceInstance = null;
}
