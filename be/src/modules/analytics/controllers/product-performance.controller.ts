import { Response, NextFunction } from 'express';
import { ProductPerformanceService } from '../services/product-performance.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const productPerformanceService = new ProductPerformanceService();

export class ProductPerformanceController {
  /**
   * Get full product performance report
   */
  static async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const start_date = req.query.start_date as string | undefined;
      const end_date = req.query.end_date as string | undefined;
      const dateRange = start_date && end_date ? { start_date, end_date } : undefined;
      const result = await productPerformanceService.getProductPerformanceReport(dateRange);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single product detail metrics
   */
  static async getProductDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const start_date = req.query.start_date as string | undefined;
      const end_date = req.query.end_date as string | undefined;
      const dateRange = start_date && end_date ? { start_date, end_date } : undefined;
      const result = await productPerformanceService.getProductDetail(productId, dateRange);
      if (!result) {
        return ApiResponse.error(res, 'NOT_FOUND', 'Sản phẩm không tìm thấy', 404);
      }
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product ranking
   */
  static async getRanking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sortBy = (req.query.sort_by as string) || 'revenue';
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await productPerformanceService.getProductRanking(sortBy as any, limit);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
