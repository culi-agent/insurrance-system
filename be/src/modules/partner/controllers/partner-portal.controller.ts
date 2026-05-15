import { Response, NextFunction } from 'express';
import { PartnerPortalService } from '../services/partner-portal.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const partnerService = new PartnerPortalService();

export class PartnerPortalController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const partnerId = req.params.partnerId || req.user!.id;
      const result = await partnerService.getDashboard(partnerId);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const partnerId = req.params.partnerId || req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await partnerService.getProducts(partnerId, page, limit);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async getPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const partnerId = req.params.partnerId || req.user!.id;
      const period = (req.query.period as string) || 'monthly';
      const result = await partnerService.getPerformanceMetrics(partnerId, period as any);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async getPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const partnerId = req.params.partnerId || req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const result = await partnerService.getPolicies(partnerId, page, limit, status);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async getClaims(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const partnerId = req.params.partnerId || req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await partnerService.getClaims(partnerId, page, limit);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }
}
