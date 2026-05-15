import { env } from '../../../config/environment';
import { getEmailService } from '../../../shared/services/notification/email.service';
import { getSmsService } from '../../../shared/services/notification/sms.service';
import { logger } from '../../../shared/utils/logger';

// In-memory OTP store (In production, use Redis)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

export class OtpService {
  static generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < env.OTP_LENGTH; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  static storeOtp(key: string, otp: string): void {
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN * 1000);
    otpStore.set(key, { otp, expiresAt });
  }

  static verifyOtp(key: string, otp: string): boolean {
    const stored = otpStore.get(key);
    if (!stored) return false;

    if (new Date() > stored.expiresAt) {
      otpStore.delete(key);
      return false;
    }

    if (stored.otp !== otp) return false;

    // OTP is single-use
    otpStore.delete(key);
    return true;
  }

  /**
   * Send OTP via email using real email provider (SendGrid/SES/mock)
   * with built-in retry logic.
   */
  static async sendEmailOtp(email: string, otp: string): Promise<void> {
    const expiresInMinutes = Math.floor(env.OTP_EXPIRES_IN / 60);
    const emailService = getEmailService();

    try {
      const result = await emailService.sendOtpEmail(email, otp, expiresInMinutes);
      if (result.success) {
        logger.info(`[OTP] Email OTP sent to ${email} via ${result.provider} (messageId: ${result.messageId})`);
      } else {
        logger.error(`[OTP] Failed to send email OTP to ${email}: ${result.error}`);
      }
    } catch (error) {
      logger.error(`[OTP] Unexpected error sending email OTP to ${email}:`, error);
    }
  }

  /**
   * Send OTP via SMS using real SMS provider (Twilio/SNS/mock)
   * with built-in retry logic.
   */
  static async sendSmsOtp(phone: string, otp: string): Promise<void> {
    const expiresInMinutes = Math.floor(env.OTP_EXPIRES_IN / 60);
    const smsService = getSmsService();

    try {
      const result = await smsService.sendOtpSms(phone, otp, expiresInMinutes);
      if (result.success) {
        logger.info(`[OTP] SMS OTP sent to ${phone} via ${result.provider} (messageId: ${result.messageId})`);
      } else {
        logger.error(`[OTP] Failed to send SMS OTP to ${phone}: ${result.error}`);
      }
    } catch (error) {
      logger.error(`[OTP] Unexpected error sending SMS OTP to ${phone}:`, error);
    }
  }

  /**
   * Send password reset OTP via email
   */
  static async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    const expiresInMinutes = Math.floor(env.OTP_EXPIRES_IN / 60);
    const emailService = getEmailService();

    try {
      const result = await emailService.sendPasswordResetEmail(email, otp, expiresInMinutes);
      if (result.success) {
        logger.info(`[OTP] Password reset email sent to ${email}`);
      } else {
        logger.error(`[OTP] Failed to send password reset email to ${email}: ${result.error}`);
      }
    } catch (error) {
      logger.error(`[OTP] Unexpected error sending reset email to ${email}:`, error);
    }
  }

  /**
   * Send password reset OTP via SMS
   */
  static async sendPasswordResetSms(phone: string, otp: string): Promise<void> {
    const expiresInMinutes = Math.floor(env.OTP_EXPIRES_IN / 60);
    const smsService = getSmsService();

    try {
      const result = await smsService.sendPasswordResetSms(phone, otp, expiresInMinutes);
      if (result.success) {
        logger.info(`[OTP] Password reset SMS sent to ${phone}`);
      } else {
        logger.error(`[OTP] Failed to send password reset SMS to ${phone}: ${result.error}`);
      }
    } catch (error) {
      logger.error(`[OTP] Unexpected error sending reset SMS to ${phone}:`, error);
    }
  }
}
