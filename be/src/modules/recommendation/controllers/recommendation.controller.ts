import { Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const recommendationService = new RecommendationService();

export class RecommendationController {
  /**
   * Get personalized recommendations
   */
  static async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await recommendationService.getRecommendations(customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get coverage gap analysis
   */
  static async getCoverageGaps(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await recommendationService.analyzeCoverageGaps(customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get "customers also bought" suggestions
   */
  static async getAlsoBought(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { insuranceType } = req.params;
      const result = await recommendationService.getAlsoBought(insuranceType);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
