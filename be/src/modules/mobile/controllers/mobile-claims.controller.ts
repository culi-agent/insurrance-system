import { Response, NextFunction } from 'express';
import { MobileClaimsService } from '../services/mobile-claims.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const mobileClaimsService = new MobileClaimsService();

export class MobileClaimsController {
  /**
   * Submit claim from mobile
   */
  static async submitClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await mobileClaimsService.submitClaim(customerId, req.body);
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pre-signed upload URL
   */
  static async getUploadUrl(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { claimId } = req.params;
      const { document_type } = req.body;
      const result = await mobileClaimsService.getUploadUrl(customerId, claimId, document_type);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add document to existing claim
   */
  static async addDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { claimId } = req.params;
      const result = await mobileClaimsService.addDocument(customerId, claimId, req.body);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get claim documents
   */
  static async getClaimDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { claimId } = req.params;
      const result = await mobileClaimsService.getClaimDocuments(customerId, claimId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get eligible policies for claim submission
   */
  static async getEligiblePolicies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await mobileClaimsService.getEligiblePolicies(customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get required documents for claim type
   */
  static async getRequiredDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const claimType = req.query.claim_type as string || 'other';
      const insuranceType = req.query.insurance_type as string || 'health';
      const result = mobileClaimsService.getRequiredDocumentsList(claimType, insuranceType);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
