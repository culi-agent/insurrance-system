import { Request, Response } from 'express';
import { LoyaltyService } from '../services/loyalty.service';

const service = new LoyaltyService();

export class LoyaltyController {
  async getAccount(req: Request, res: Response) {
    try {
      const customerId = (req as any).user.id;
      const account = await service.getAccount(customerId);
      res.json({ success: true, data: account });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'ACCOUNT_ERROR', message: error.message } });
    }
  }

  async getPointHistory(req: Request, res: Response) {
    try {
      const customerId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await service.getPointHistory(customerId, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'HISTORY_ERROR', message: error.message } });
    }
  }

  async getRedemptionOptions(req: Request, res: Response) {
    try {
      const customerId = (req as any).user.id;
      const options = await service.getRedemptionOptions(customerId);
      res.json({ success: true, data: options });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'OPTIONS_ERROR', message: error.message } });
    }
  }

  async redeemPoints(req: Request, res: Response) {
    try {
      const customerId = (req as any).user.id;
      const { option_id } = req.body;
      const result = await service.redeemPoints(customerId, option_id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'REDEEM_FAILED', message: error.message } });
    }
  }

  async getBadges(req: Request, res: Response) {
    try {
      const customerId = (req as any).user.id;
      const badges = await service.getCustomerBadges(customerId);
      res.json({ success: true, data: badges });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'BADGES_ERROR', message: error.message } });
    }
  }

  async checkAchievements(req: Request, res: Response) {
    try {
      const customerId = (req as any).user.id;
      const newBadges = await service.checkBadgeAchievements(customerId);
      res.json({ success: true, data: { new_badges: newBadges, count: newBadges.length } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'ACHIEVEMENT_ERROR', message: error.message } });
    }
  }

  async getReferralTiers(req: Request, res: Response) {
    try {
      const customerId = (req as any).user.id;
      const tiers = await service.getReferralTiers(customerId);
      res.json({ success: true, data: tiers });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'TIERS_ERROR', message: error.message } });
    }
  }
}
