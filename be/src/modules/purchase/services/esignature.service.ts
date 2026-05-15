/**
 * E-Signature Service (OTP-based)
 * Provides electronic signature for policy documents using OTP verification
 */
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../shared/utils/logger';

export interface SignatureRequest {
  policy_id: string;
  customer_id: string;
  customer_phone: string;
  customer_email: string;
  document_hash: string;
}

export interface SignatureVerifyInput {
  signature_id: string;
  otp_code: string;
}

export interface SignatureResult {
  signature_id: string;
  status: 'pending' | 'verified' | 'expired' | 'failed';
  signed_at?: string;
  certificate?: {
    serial: string;
    issued_at: string;
    signer: string;
    document_hash: string;
  };
}

// In-memory OTP store (in production: use Redis)
const otpStore = new Map<string, { otp: string; expires_at: number; attempts: number; request: SignatureRequest }>();

export class ESignatureService {
  private static readonly OTP_LENGTH = 6;
  private static readonly OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_ATTEMPTS = 3;

  /**
   * Request e-signature (sends OTP)
   */
  static async requestSignature(input: SignatureRequest): Promise<{ signature_id: string; expires_in: number }> {
    const signatureId = `SIG-${uuidv4().slice(0, 8).toUpperCase()}`;
    const otp = this.generateOtp();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;

    // Store OTP
    otpStore.set(signatureId, {
      otp,
      expires_at: expiresAt,
      attempts: 0,
      request: input,
    });

    // Send OTP via SMS (in production: integrate with SMS provider)
    logger.info(`[E-Signature] OTP ${otp} sent to ${input.customer_phone} for signature ${signatureId}`);

    // Also send via email
    logger.info(`[E-Signature] OTP sent to ${input.customer_email} for signature ${signatureId}`);

    return {
      signature_id: signatureId,
      expires_in: this.OTP_EXPIRY_MS / 1000,
    };
  }

  /**
   * Verify OTP and complete e-signature
   */
  static async verifySignature(input: SignatureVerifyInput): Promise<SignatureResult> {
    const stored = otpStore.get(input.signature_id);

    if (!stored) {
      return {
        signature_id: input.signature_id,
        status: 'failed',
      };
    }

    // Check expiry
    if (Date.now() > stored.expires_at) {
      otpStore.delete(input.signature_id);
      return {
        signature_id: input.signature_id,
        status: 'expired',
      };
    }

    // Check attempts
    stored.attempts++;
    if (stored.attempts > this.MAX_ATTEMPTS) {
      otpStore.delete(input.signature_id);
      return {
        signature_id: input.signature_id,
        status: 'failed',
      };
    }

    // Verify OTP
    if (input.otp_code !== stored.otp) {
      return {
        signature_id: input.signature_id,
        status: 'failed',
      };
    }

    // OTP correct - generate signature certificate
    const certificate = {
      serial: `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      issued_at: new Date().toISOString(),
      signer: stored.request.customer_id,
      document_hash: stored.request.document_hash,
    };

    // Cleanup
    otpStore.delete(input.signature_id);

    logger.info(`[E-Signature] Signature verified: ${input.signature_id}`);

    return {
      signature_id: input.signature_id,
      status: 'verified',
      signed_at: new Date().toISOString(),
      certificate,
    };
  }

  /**
   * Resend OTP for signature
   */
  static async resendOtp(signatureId: string): Promise<{ success: boolean; expires_in?: number }> {
    const stored = otpStore.get(signatureId);

    if (!stored) {
      return { success: false };
    }

    // Generate new OTP
    const newOtp = this.generateOtp();
    stored.otp = newOtp;
    stored.expires_at = Date.now() + this.OTP_EXPIRY_MS;
    stored.attempts = 0;

    logger.info(`[E-Signature] Resent OTP ${newOtp} for signature ${signatureId}`);

    return {
      success: true,
      expires_in: this.OTP_EXPIRY_MS / 1000,
    };
  }

  private static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
