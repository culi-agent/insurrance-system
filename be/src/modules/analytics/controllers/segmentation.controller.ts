import { Response, NextFunction } from 'express';
import { CustomerSegmentationService } from '../services/customer-segmentation.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const segmentationService = new CustomerSegmentationService();

export class SegmentationController {
  /**
   * Run RFM analysis
   */
  static async runRFMAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await segmentationService.runRFMAnalysis();
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get segments overview
   */
  static async getSegmentsOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await segmentationService.getSegmentsOverview();
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customers by segment
   */
  static async getCustomersBySegment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { segmentName } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await segmentationService.getCustomersBySegment(segmentName, page, limit);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create custom segment
   */
  static async createSegment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, criteria } = req.body;
      const result = await segmentationService.createCustomSegment(name, description, criteria);
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all segments
   */
  static async listSegments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await segmentationService.listSegments();
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer LTV
   */
  static async getCustomerLTV(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.params;
      const result = await segmentationService.calculateCustomerLTV(customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get segment customer IDs (for campaigns)
   */
  static async getSegmentCustomerIds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { segmentId } = req.params;
      const result = await segmentationService.getSegmentCustomerIds(segmentId);
      return ApiResponse.success(res, { customer_ids: result, count: result.length });
    } catch (error) {
      next(error);
    }
  }
}
