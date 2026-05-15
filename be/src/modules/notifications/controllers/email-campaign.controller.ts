import { Response, NextFunction } from 'express';
import { EmailCampaignService } from '../services/email-campaign.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const campaignService = new EmailCampaignService();

export class EmailCampaignController {
  static async createCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await campaignService.createCampaign(req.body);
      return ApiResponse.created(res, result);
    } catch (error) { next(error); }
  }

  static async sendCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { campaignId } = req.params;
      const result = await campaignService.sendCampaign(campaignId);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async getCampaignStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { campaignId } = req.params;
      const result = await campaignService.getCampaignStats(campaignId);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async listCampaigns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const result = await campaignService.listCampaigns(page, limit, status);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async trackOpen(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { campaignId } = req.params;
      const customerId = req.query.cid as string;
      if (customerId) await campaignService.trackOpen(campaignId, customerId);
      // Return 1x1 transparent pixel
      const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.setHeader('Content-Type', 'image/gif');
      return res.send(pixel);
    } catch (error) { next(error); }
  }

  static async trackClick(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { campaignId } = req.params;
      const { cid, url } = req.query as Record<string, string>;
      if (cid) await campaignService.trackClick(campaignId, cid, url);
      return res.redirect(url || '/');
    } catch (error) { next(error); }
  }

  static async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, subject, html, category } = req.body;
      const result = await campaignService.createTemplate(name, subject, html, category);
      return ApiResponse.created(res, result);
    } catch (error) { next(error); }
  }

  static async listTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const result = await campaignService.listTemplates(category);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }
}
