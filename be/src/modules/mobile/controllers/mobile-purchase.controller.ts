import { Response, NextFunction } from 'express';
import { MobilePurchaseService } from '../services/mobile-purchase.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const mobilePurchaseService = new MobilePurchaseService();

export class MobilePurchaseController {
  /**
   * Quick purchase from mobile app
   */
  static async quickPurchase(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await mobilePurchaseService.quickPurchase(customerId, req.body);
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check payment status (polling)
   */
  static async checkPaymentStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { orderId } = req.params;
      const result = await mobilePurchaseService.checkPaymentStatus(customerId, orderId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order history for mobile
   */
  static async getOrderHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await mobilePurchaseService.getOrderHistory(customerId, page, limit);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retry failed payment
   */
  static async retryPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { orderId } = req.params;
      const { payment_method } = req.body;
      const result = await mobilePurchaseService.retryPayment(customerId, orderId, payment_method);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
