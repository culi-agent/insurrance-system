import { Response, NextFunction } from 'express';
import { CustomerAnalyticsService } from '../services/customer-analytics.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const customerAnalyticsService = new CustomerAnalyticsService();

export class CustomerAnalyticsController {
  /**
   * Get full customer analytics report
   */
  static async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const start_date = req.query.start_date as string | undefined;
      const end_date = req.query.end_date as string | undefined;
      const dateRange = start_date && end_date ? { start_date, end_date } : undefined;
      const result = await customerAnalyticsService.getCustomerReport(dateRange);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get monthly retention data
   */
  static async getRetention(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const result = await customerAnalyticsService.getMonthlyRetention(months);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cohort analysis
   */
  static async getCohortAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const result = await customerAnalyticsService.getCohortAnalysis(months);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
