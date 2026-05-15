import { Response, NextFunction } from 'express';
import { ScheduledNotificationService } from '../services/scheduled-notification.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const schedulerService = new ScheduledNotificationService();

export class ScheduledNotificationController {
  /** Trigger all jobs (admin/cron) */
  static async runAllJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await schedulerService.runAllJobs();
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  /** Process pending notifications */
  static async processNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await schedulerService.processScheduledNotifications();
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  /** Generate renewal reminders */
  static async generateRenewalReminders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await schedulerService.generateRenewalReminders();
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  /** Get scheduler status */
  static async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await schedulerService.getSchedulerStatus();
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  /** Cancel notification */
  static async cancelNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      await schedulerService.cancelNotification(notificationId);
      return ApiResponse.success(res, { message: 'Đã hủy thông báo' });
    } catch (error) { next(error); }
  }
}
