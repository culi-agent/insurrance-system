import { Response, NextFunction } from 'express';
import { PurchaseService } from '../services/purchase.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const purchaseService = new PurchaseService();

export class PurchaseController {
  /**
   * Create purchase order from quotation
   */
  static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await purchaseService.createOrder(customerId, req.body);
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update wizard step
   */
  static async updateWizardStep(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { orderId } = req.params;
      const result = await purchaseService.updateWizardStep(orderId, customerId, req.body);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Perform eKYC verification
   */
  static async performEkyc(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { orderId } = req.params;
      const result = await purchaseService.performEkyc(orderId, customerId, req.body);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Run underwriting
   */
  static async runUnderwriting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { orderId } = req.params;
      const result = await purchaseService.runUnderwriting(orderId, customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiate payment
   */
  static async initiatePayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { orderId } = req.params;
      const result = await purchaseService.initiatePayment(orderId, customerId, req.body);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Payment callback (VNPay IPN)
   */
  static async paymentCallbackVNPay(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await purchaseService.handlePaymentCallback('vnpay', req.query as Record<string, any>);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Payment callback (Momo)
   */
  static async paymentCallbackMomo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await purchaseService.handlePaymentCallback('momo', req.body);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order detail
   */
  static async getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { orderId } = req.params;
      const result = await purchaseService.getOrder(orderId, customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer's orders
   */
  static async getMyOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 10;
      const result = await purchaseService.getCustomerOrders(customerId, page, perPage);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer's policies
   */
  static async getMyPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 10;
      const status = req.query.status as string | undefined;
      const result = await purchaseService.getCustomerPolicies(customerId, page, perPage, status);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get policy detail
   */
  static async getPolicyDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId } = req.params;
      const result = await purchaseService.getPolicyById(policyId, customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { orderId } = req.params;
      const { reason } = req.body;
      const result = await purchaseService.cancelOrder(orderId, customerId, reason);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
