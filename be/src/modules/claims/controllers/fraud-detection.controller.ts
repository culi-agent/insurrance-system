import { Request, Response } from 'express';
import { FraudDetectionService } from '../services/fraud-detection.service';

const service = new FraudDetectionService();

export class FraudDetectionController {
  async analyzeClaim(req: Request, res: Response) {
    try {
      const result = await service.analyzeClaim(req.params.claimId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'ANALYSIS_ERROR', message: error.message } });
    }
  }

  async verifyDocument(req: Request, res: Response) {
    try {
      const result = await service.verifyDocument(req.params.documentId, req.params.claimId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'VERIFICATION_ERROR', message: error.message } });
    }
  }

  async getFraudAnalytics(req: Request, res: Response) {
    try {
      const result = await service.getFraudAnalytics();
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'ANALYTICS_ERROR', message: error.message } });
    }
  }
}
