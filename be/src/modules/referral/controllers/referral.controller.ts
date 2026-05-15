import { Response, NextFunction } from 'express';
import { ReferralService } from '../services/referral.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const referralService = new ReferralService();

export class ReferralController {
  /**
   * Generate referral code
   */
  static async generateCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await referralService.generateReferralCode(customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get referral statistics
   */
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await referralService.getReferralStats(customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my referrals list
   */
  static async getMyReferrals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 10;
      const result = await referralService.getMyReferrals(customerId, page, perPage);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
