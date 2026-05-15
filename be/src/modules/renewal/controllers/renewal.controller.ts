import { Response, NextFunction } from 'express';
import { RenewalService } from '../services/renewal.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const renewalService = new RenewalService();

export class RenewalController {
  /**
   * Renew policy
   */
  static async renewPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId } = req.params;
      const result = await renewalService.renewPolicy(policyId, customerId, req.body);
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set auto-renewal preference
   */
  static async setAutoRenewal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId } = req.params;
      const result = await renewalService.setAutoRenewal(policyId, customerId, req.body);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel policy
   */
  static async cancelPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId } = req.params;
      const result = await renewalService.cancelPolicy(policyId, customerId, req.body);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get policies eligible for renewal
   */
  static async getEligibleForRenewal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await renewalService.getEligibleForRenewal(customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger renewal reminders (admin/cron)
   */
  static async triggerRenewalReminders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await renewalService.sendRenewalReminders();
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process auto-renewals (admin/cron)
   */
  static async processAutoRenewals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await renewalService.processAutoRenewals();
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
