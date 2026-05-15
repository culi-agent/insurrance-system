import { Response, NextFunction } from 'express';
import { MobileProfileService } from '../services/mobile-profile.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const profileService = new MobileProfileService();

export class MobileProfileController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await profileService.getProfile(req.user!.id);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await profileService.updateProfile(req.user!.id, req.body);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { current_password, new_password } = req.body;
      const result = await profileService.changePassword(req.user!.id, current_password, new_password);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await profileService.getSettings(req.user!.id);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await profileService.updateSettings(req.user!.id, req.body);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async getSecuritySettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await profileService.getSecuritySettings(req.user!.id);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async logoutSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      await profileService.logoutSession(req.user!.id, sessionId);
      return ApiResponse.success(res, { message: 'Đã đăng xuất phiên' });
    } catch (error) { next(error); }
  }

  static async logoutAllSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await profileService.logoutAllSessions(req.user!.id);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async requestDeletion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const result = await profileService.requestAccountDeletion(req.user!.id, reason);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }
}
