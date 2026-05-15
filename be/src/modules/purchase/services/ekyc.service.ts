/**
 * eKYC Service - CCCD OCR Integration
 * Simulates integration with eKYC provider for Vietnamese ID card verification
 */

export interface EkycVerificationInput {
  id_card_front_image: string; // base64 or URL
  id_card_back_image: string;  // base64 or URL
  selfie_image?: string;       // base64 or URL for face matching
}

export interface EkycResult {
  success: boolean;
  verification_id: string;
  status: 'verified' | 'failed' | 'manual_review';
  confidence_score: number;
  extracted_data: {
    full_name: string;
    id_number: string;
    date_of_birth: string;
    gender: string;
    nationality: string;
    place_of_origin: string;
    place_of_residence: string;
    expiry_date: string;
    issue_date: string;
    issued_by: string;
  };
  face_match?: {
    score: number;
    matched: boolean;
  };
  errors?: string[];
}

export class EkycService {
  /**
   * Verify identity using CCCD OCR
   * In production, this would call an external eKYC provider (e.g., VNPay eKYC, FPT.AI, etc.)
   */
  static async verifyIdentity(input: EkycVerificationInput): Promise<EkycResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate inputs
    if (!input.id_card_front_image || !input.id_card_back_image) {
      return {
        success: false,
        verification_id: this.generateVerificationId(),
        status: 'failed',
        confidence_score: 0,
        extracted_data: {} as any,
        errors: ['Missing required ID card images'],
      };
    }

    // Simulate successful OCR extraction
    const verificationId = this.generateVerificationId();
    const confidenceScore = 0.92 + Math.random() * 0.08; // 92-100%

    const result: EkycResult = {
      success: true,
      verification_id: verificationId,
      status: confidenceScore >= 0.9 ? 'verified' : 'manual_review',
      confidence_score: Math.round(confidenceScore * 100) / 100,
      extracted_data: {
        full_name: 'NGUYEN VAN A',
        id_number: '079' + Math.random().toString().slice(2, 11),
        date_of_birth: '1990-05-15',
        gender: 'Nam',
        nationality: 'Việt Nam',
        place_of_origin: 'TP. Hồ Chí Minh',
        place_of_residence: '123 Nguyễn Huệ, Q.1, TP.HCM',
        expiry_date: '2030-05-15',
        issue_date: '2020-05-15',
        issued_by: 'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư',
      },
    };

    // Face match if selfie provided
    if (input.selfie_image) {
      const faceScore = 0.85 + Math.random() * 0.15;
      result.face_match = {
        score: Math.round(faceScore * 100) / 100,
        matched: faceScore >= 0.8,
      };
    }

    return result;
  }

  /**
   * Validate CCCD number format
   */
  static validateCCCDNumber(idNumber: string): boolean {
    // Vietnamese CCCD is 12 digits
    return /^\d{12}$/.test(idNumber);
  }

  /**
   * Validate CMND number format (old format)
   */
  static validateCMNDNumber(idNumber: string): boolean {
    // Vietnamese CMND is 9 or 12 digits
    return /^\d{9}$/.test(idNumber) || /^\d{12}$/.test(idNumber);
  }

  private static generateVerificationId(): string {
    return `EKYC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}
