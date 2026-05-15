import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // ========== PRODUCT MANAGEMENT ==========

  createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.createProduct(req.body);
      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.updateProduct(req.params.id, req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.deleteProduct(req.params.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 20;
      const status = req.query.status as string;
      const result = await this.adminService.getProducts({ status }, page, perPage);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.per_page);
    } catch (error) {
      next(error);
    }
  };

  // ========== CATEGORY MANAGEMENT ==========

  createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.createCategory(req.body);
      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.updateCategory(req.params.id, req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.deleteCategory(req.params.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const includeInactive = req.query.include_inactive === 'true';
      const result = await this.adminService.getCategories(includeInactive);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // ========== INSURER MANAGEMENT ==========

  createInsurer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.createInsurer(req.body);
      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  updateInsurer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.updateInsurer(req.params.id, req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  deleteInsurer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.deleteInsurer(req.params.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getInsurers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const includeInactive = req.query.include_inactive === 'true';
      const result = await this.adminService.getInsurers(includeInactive);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // ========== CUSTOMER MANAGEMENT ==========

  getCustomers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 20;
      const status = req.query.status as string;
      const search = req.query.search as string;
      const result = await this.adminService.getCustomers({ status, search }, page, perPage);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.per_page);
    } catch (error) {
      next(error);
    }
  };

  updateCustomerStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.updateCustomerStatus(req.params.id, req.body.status);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // ========== DASHBOARD STATS ==========

  getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.getDashboardStats();
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
