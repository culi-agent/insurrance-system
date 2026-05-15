import { Response, NextFunction } from 'express';
import { PushNotificationService } from '../services/push-notification.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const pushService = new PushNotificationService();

export class PushNotificationController {
  /**
   * Register device for push notifications
   */
  static async registerDevice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await pushService.registerDevice(customerId, req.body);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unregister device
   */
  static async unregisterDevice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { deviceId } = req.params;
      await pushService.unregisterDevice(customerId, deviceId);
      return ApiResponse.success(res, { message: 'Đã hủy đăng ký thiết bị' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification preferences
   */
  static async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await pushService.getPreferences(customerId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await pushService.updatePreferences(customerId, req.body);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification history
   */
  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await pushService.getNotificationHistory(customerId, page, limit);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { notificationId } = req.params;
      await pushService.markAsRead(customerId, notificationId);
      return ApiResponse.success(res, { message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      await pushService.markAllAsRead(customerId);
      return ApiResponse.success(res, { message: 'Đã đánh dấu tất cả đã đọc' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const count = await pushService.getUnreadCount(customerId);
      return ApiResponse.success(res, { unread_count: count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Send notification to customer (admin only)
   */
  static async adminSendNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { customer_id, type, title, body, data } = req.body;
      const result = await pushService.sendToCustomer(customer_id, type, { title, body, data });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Send batch notification
   */
  static async adminSendBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { customer_ids, type, title, body, data } = req.body;
      const result = await pushService.sendBatch(customer_ids, type, { title, body, data });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
