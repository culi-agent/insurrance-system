import { Response, NextFunction } from 'express';
import { MobileClaimsTrackingService } from '../services/mobile-claims-tracking.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const trackingService = new MobileClaimsTrackingService();

export class MobileClaimsTrackingController {
  /**
   * Get claim detail with timeline
   */
  static async getClaimDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { claimId } = req.params;
      const result = await trackingService.getClaimDetail(customerId, claimId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get claim timeline
   */
  static async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { claimId } = req.params;
      const result = await trackingService.getTimeline(claimId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get claim messages
   */
  static async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { claimId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await trackingService.getMessages(customerId, claimId, page, limit);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send message
   */
  static async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { claimId } = req.params;
      const { message, attachments } = req.body;
      const result = await trackingService.sendMessage(customerId, claimId, message, attachments);
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Withdraw claim
   */
  static async withdrawClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { claimId } = req.params;
      const { reason } = req.body;
      const result = await trackingService.withdrawClaim(customerId, claimId, reason);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread messages count
   */
  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const count = await trackingService.getUnreadMessagesCount(customerId);
      return ApiResponse.success(res, { unread_count: count });
    } catch (error) {
      next(error);
    }
  }
}
