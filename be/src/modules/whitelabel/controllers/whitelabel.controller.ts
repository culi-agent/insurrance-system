import { Request, Response } from 'express';
import { WhitelabelService } from '../services/whitelabel.service';

const service = new WhitelabelService();

export class WhitelabelController {
  async createConfig(req: Request, res: Response) {
    try {
      const result = await service.createConfig(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
    }
  }

  async getConfigByDomain(req: Request, res: Response) {
    try {
      const domain = req.params.domain || req.hostname;
      const config = await service.getConfigByDomain(domain);
      if (!config) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Config not found' } });
      res.json({ success: true, data: config });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
    }
  }

  async updateBranding(req: Request, res: Response) {
    try {
      await service.updateBranding(req.params.configId, req.body);
      res.json({ success: true, message: 'Branding updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }

  async updateFeatures(req: Request, res: Response) {
    try {
      await service.updateFeatures(req.params.configId, req.body);
      res.json({ success: true, message: 'Features updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }

  async listConfigs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await service.listConfigs(page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'LIST_ERROR', message: error.message } });
    }
  }

  async registerBancassurance(req: Request, res: Response) {
    try {
      const result = await service.registerBancassurance(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'REGISTER_FAILED', message: error.message } });
    }
  }

  async getBancassuranceProducts(req: Request, res: Response) {
    try {
      const products = await service.getBancassuranceProducts(req.params.bankCode);
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
    }
  }

  async processBancassuranceSale(req: Request, res: Response) {
    try {
      const result = await service.processBancassuranceSale(req.params.bankCode, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'SALE_FAILED', message: error.message } });
    }
  }
}
