import { Request, Response } from 'express';
import { BusinessInsuranceService } from '../services/business-insurance.service';

const service = new BusinessInsuranceService();

export class BusinessInsuranceController {
  async getPropertyQuote(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const result = await service.getPropertyQuote({ ...req.body, enterprise_id: enterpriseId });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'QUOTE_FAILED', message: error.message } });
    }
  }

  async getLiabilityQuote(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const result = await service.getLiabilityQuote({ ...req.body, enterprise_id: enterpriseId });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'QUOTE_FAILED', message: error.message } });
    }
  }

  async getInterruptionQuote(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const result = await service.getInterruptionQuote({ ...req.body, enterprise_id: enterpriseId });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'QUOTE_FAILED', message: error.message } });
    }
  }

  async purchaseBusinessInsurance(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const { quote_id, additional_info } = req.body;
      const result = await service.purchaseBusinessInsurance(enterpriseId, quote_id, additional_info);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'PURCHASE_FAILED', message: error.message } });
    }
  }
}
