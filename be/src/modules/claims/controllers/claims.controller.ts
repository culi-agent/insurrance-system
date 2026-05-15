import { Response, NextFunction } from 'express';
import { ClaimsService } from '../services/claims.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const claimsService = new ClaimsService();

export class ClaimsController {
  // Customer endpoints
  static async submitClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await claimsService.submitClaim(req.user!.id, req.body);
      return ApiResponse.created(res, result);
    } catch (error) { next(error); }
  }

  static async getMyClaims(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 10;
      const status = req.query.status as string | undefined;
      const result = await claimsService.getCustomerClaims(req.user!.id, page, perPage, status);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async getClaimDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await claimsService.getClaimById(req.params.claimId, req.user!.id);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await claimsService.uploadDocument(req.params.claimId, req.user!.id, req.body);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async addMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await claimsService.addMessage(
        req.params.claimId, req.user!.id, req.user!.email, 'customer', req.body.message
      );
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  // Admin endpoints
  static async getClaimsQueue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 20;
      const status = req.query.status as string | undefined;
      const priority = req.query.priority as string | undefined;
      const result = await claimsService.getClaimsQueue(page, perPage, status, priority);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async assignClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await claimsService.assignClaim(req.params.claimId, req.body.assignee_id);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async decideClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { decision, approved_amount, reason, assessment } = req.body;
      const result = await claimsService.decideClaim(req.params.claimId, req.user!.id, decision, {
        approved_amount, reason, assessment,
      });
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async adminAddMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await claimsService.addMessage(
        req.params.claimId, req.user!.id, 'Nhân viên xử lý', 'agent', req.body.message
      );
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }
}
