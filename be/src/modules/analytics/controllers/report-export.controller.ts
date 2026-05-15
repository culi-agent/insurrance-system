import { Response, NextFunction } from 'express';
import { ReportExportService } from '../services/report-export.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const reportExportService = new ReportExportService();

export class ReportExportController {
  /**
   * Export report (CSV or PDF)
   */
  static async exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { report_type, format, date_range, filters, columns } = req.body;
      const result = await reportExportService.exportReport(userId, { report_type, format, date_range, filters, columns });

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        return res.send(result.data);
      }

      // PDF - return as base64 in JSON or as binary
      if (req.query.download === 'true') {
        const pdfBuffer = Buffer.from(result.data, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        return res.send(pdfBuffer);
      }

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get export history
   */
  static async getExportHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await reportExportService.getExportHistory(userId, page, limit);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
