import { Request, Response, NextFunction } from 'express';
import { ABTestingService } from '../services/ab-testing.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const abService = new ABTestingService();

export class ABTestingController {
  /**
   * Create experiment (admin)
   */
  static async createExperiment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await abService.createExperiment(req.body);
      return ApiResponse.created(res, result);
    } catch (error) { next(error); }
  }

  /**
   * List experiments (admin)
   */
  static async listExperiments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const result = await abService.listExperiments(status);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  /**
   * Get experiment results (admin)
   */
  static async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await abService.getExperimentResults(req.params.experimentId);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  /**
   * Update experiment status (admin)
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await abService.updateStatus(req.params.experimentId, req.body.status);
      return ApiResponse.success(res, { message: 'Status updated' });
    } catch (error) { next(error); }
  }

  /**
   * Get assignment for current user (client-facing)
   */
  static async getAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { featureKey } = req.params;
      const userId = (req as AuthenticatedRequest).user?.id || req.ip || 'anonymous';
      const result = await abService.getAssignment(featureKey, userId);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  /**
   * Track event (client-facing)
   */
  static async trackEvent(req: Request, res: Response, next: NextFunction) {
    try {
      await abService.trackEvent(req.body);
      return ApiResponse.success(res, { tracked: true });
    } catch (error) { next(error); }
  }
}
