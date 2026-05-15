import { Response, NextFunction } from 'express';
import { FinancialReportService } from '../services/financial-report.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const financialReportService = new FinancialReportService();

export class FinancialReportController {
  /**
   * Get full financial report
   */
  static async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const start_date = req.query.start_date as string | undefined;
      const end_date = req.query.end_date as string | undefined;
      const dateRange = start_date && end_date ? { start_date, end_date } : undefined;
      const result = await financialReportService.getFinancialReport(dateRange);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get commission statement for insurer
   */
  static async getCommissionStatement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { insurerId } = req.params;
      const period = req.query.period as string || new Date().toISOString().slice(0, 7);
      const result = await financialReportService.getCommissionStatement(insurerId, period);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get monthly P&L trend
   */
  static async getMonthlyPnL(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const result = await financialReportService.getMonthlyPnL(months);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
