import { Request, Response } from 'express';
import { BIAnalyticsService } from '../services/bi-analytics.service';

const service = new BIAnalyticsService();

export class BIAnalyticsController {
  async getDashboard(req: Request, res: Response) {
    try {
      const period = (req.query.period as 'mtd' | 'qtd' | 'ytd' | 'all') || 'mtd';
      const result = await service.getDashboard(period);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'BI_ERROR', message: error.message } });
    }
  }

  async getReconciliation(req: Request, res: Response) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const result = await service.getReconciliation(year, month);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'RECONCILIATION_ERROR', message: error.message } });
    }
  }

  async getYearEndReport(req: Request, res: Response) {
    try {
      const year = parseInt(req.params.year) || new Date().getFullYear();
      const result = await service.getYearEndReport(year);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'YEAREND_ERROR', message: error.message } });
    }
  }

  async buildCustomReport(req: Request, res: Response) {
    try {
      const result = await service.buildCustomReport(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'REPORT_ERROR', message: error.message } });
    }
  }
}
