import { Response, NextFunction } from 'express';
import { RecommendationV2Service } from '../services/recommendation-v2.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const recV2Service = new RecommendationV2Service();

export class RecommendationV2Controller {
  /**
   * Get personalized recommendations (v2 ML-enhanced)
   */
  static async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const context = {
        device: (req.headers['x-device-type'] as any) || 'desktop',
        recent_life_events: req.query.life_events ? (req.query.life_events as string).split(',') : undefined,
      };
      const result = await recV2Service.getRecommendations(customerId, context);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Track behavior signal
   */
  static async trackBehavior(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      await recV2Service.trackBehavior(customerId, req.body);
      return ApiResponse.success(res, { message: 'tracked' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Track recommendation interaction
   */
  static async trackInteraction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { recommendation_id, action } = req.body;
      await recV2Service.trackInteraction(customerId, recommendation_id, action);
      return ApiResponse.success(res, { message: 'tracked' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trending products
   */
  static async getTrending(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const result = await recV2Service.getTrendingProducts(limit);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
