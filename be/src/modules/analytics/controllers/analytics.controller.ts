import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuditLogService } from '../services/audit-log.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  /**
   * Get KPI widgets
   */
  static async getKPIs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getKPIWidgets();
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales report
   */
  static async getSalesReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'monthly';
      const dateRange = req.query.start_date ? {
        start_date: req.query.start_date as string,
        end_date: (req.query.end_date as string) || new Date().toISOString(),
      } : undefined;
      const result = await analyticsService.getSalesReport(period, dateRange);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversion funnel
   */
  static async getConversionFunnel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dateRange = req.query.start_date ? {
        start_date: req.query.start_date as string,
        end_date: (req.query.end_date as string) || new Date().toISOString(),
      } : undefined;
      const result = await analyticsService.getConversionFunnel(dateRange);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue breakdown
   */
  static async getRevenueBreakdown(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dateRange = req.query.start_date ? {
        start_date: req.query.start_date as string,
        end_date: (req.query.end_date as string) || new Date().toISOString(),
      } : undefined;
      const result = await analyticsService.getRevenueBreakdown(dateRange);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuditLogService.query({
        user_id: req.query.user_id as string,
        action: req.query.action as string,
        resource_type: req.query.resource_type as string,
        resource_id: req.query.resource_id as string,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        page: parseInt(req.query.page as string) || 1,
        per_page: parseInt(req.query.per_page as string) || 20,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export report as CSV
   */
  static async exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { report_type, period } = req.query;
      let data: any[];

      switch (report_type) {
        case 'sales':
          data = await analyticsService.getSalesReport(
            (period as 'daily' | 'weekly' | 'monthly') || 'monthly'
          );
          break;
        default:
          data = [];
      }

      // Generate CSV
      if (data.length === 0) {
        return res.status(200).send('No data');
      }

      const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')),
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report-${report_type}-${Date.now()}.csv`);
      return res.send(csvRows.join('\n'));
    } catch (error) {
      next(error);
    }
  }
}
