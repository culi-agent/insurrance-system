import { Response, NextFunction } from 'express';
import { SystemConfigService } from '../services/system-config.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const configService = new SystemConfigService();

export class SystemConfigController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const category = req.query.category as string; return ApiResponse.success(res, await configService.getAll(category)); } catch (e) { next(e); }
  }
  static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { return ApiResponse.success(res, await configService.getCategories()); } catch (e) { next(e); }
  }
  static async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const val = await configService.get(req.params.key); return ApiResponse.success(res, { key: req.params.key, value: val }); } catch (e) { next(e); }
  }
  static async set(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { key, value, category, description, type } = req.body;
      await configService.set(key, value, category, description, type, req.user!.id);
      return ApiResponse.success(res, { message: 'Cập nhật thành công' });
    } catch (e) { next(e); }
  }
  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await configService.delete(req.params.key); return ApiResponse.success(res, { message: 'Đã xóa' }); } catch (e) { next(e); }
  }
  static async initDefaults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await configService.initDefaults(); return ApiResponse.success(res, { message: 'Đã khởi tạo cấu hình mặc định' }); } catch (e) { next(e); }
  }
}
