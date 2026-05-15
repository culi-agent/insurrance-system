import { Response, NextFunction } from 'express';
import { MobileDashboardService } from '../services/mobile-dashboard.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const dashboardService = new MobileDashboardService();

export class MobileDashboardController {
  /**
   * Get dashboard overview
   */
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await dashboardService.getDashboardOverview(customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get policies list
   */
  static async getPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await dashboardService.getPolicies(customerId, { status, page, limit });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get policy detail
   */
  static async getPolicyDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId } = req.params;
      const result = await dashboardService.getPolicyDetail(customerId, policyId);
      if (!result) {
        return ApiResponse.error(res, 'NOT_FOUND', 'Hợp đồng không tìm thấy', 404);
      }
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get claims list
   */
  static async getClaims(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await dashboardService.getClaims(customerId, { status, page, limit });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
