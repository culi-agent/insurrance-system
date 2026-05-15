import { Response, NextFunction } from 'express';
import { CMSService } from '../services/cms.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const cmsService = new CMSService();

export class CMSController {
  // Pages
  static async createPage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { return ApiResponse.created(res, await cmsService.createPage(req.body)); } catch (e) { next(e); }
  }
  static async updatePage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await cmsService.updatePage(req.params.id, req.body); return ApiResponse.success(res, { message: 'Cập nhật thành công' }); } catch (e) { next(e); }
  }
  static async getPage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await cmsService.getPage(req.params.slug); return r ? ApiResponse.success(res, r) : ApiResponse.error(res, 'NOT_FOUND', 'Trang không tìm thấy', 404); } catch (e) { next(e); }
  }
  static async listPages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { return ApiResponse.success(res, await cmsService.listPages(req.query.category as string)); } catch (e) { next(e); }
  }
  static async deletePage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await cmsService.deletePage(req.params.id); return ApiResponse.success(res, { message: 'Đã xóa' }); } catch (e) { next(e); }
  }
  // FAQ
  static async createFAQ(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { return ApiResponse.created(res, await cmsService.createFAQ(req.body)); } catch (e) { next(e); }
  }
  static async listFAQs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { return ApiResponse.success(res, await cmsService.listFAQs(req.query.category as string, req.query.published === 'true')); } catch (e) { next(e); }
  }
  static async updateFAQ(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await cmsService.updateFAQ(req.params.id, req.body); return ApiResponse.success(res, { message: 'Cập nhật thành công' }); } catch (e) { next(e); }
  }
  static async voteFAQ(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await cmsService.voteFAQ(req.params.id, req.body.helpful); return ApiResponse.success(res, { message: 'Đã ghi nhận' }); } catch (e) { next(e); }
  }
}
