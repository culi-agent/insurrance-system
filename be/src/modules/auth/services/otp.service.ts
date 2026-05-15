import { env } from '../../../config/environment';

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

  static async sendEmailOtp(email: string, otp: string): Promise<void> {
    // In production: integrate with email service (SendGrid, SES, etc.)
    console.log(`[OTP] Sending OTP ${otp} to email: ${email}`);
  }

  static async sendSmsOtp(phone: string, otp: string): Promise<void> {
    // In production: integrate with SMS service (Twilio, etc.)
    console.log(`[OTP] Sending OTP ${otp} to phone: ${phone}`);
  }
}
