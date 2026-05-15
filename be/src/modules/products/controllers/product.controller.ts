import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { ApiResponse } from '../../../shared/utils/response';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 20;
      const filters = {
        category_id: req.query.category_id as string,
        insurer_id: req.query.insurer_id as string,
        min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
        is_featured: req.query.is_featured === 'true' ? true : undefined,
        search: req.query.search as string,
      };

      const result = await this.productService.getProducts(filters, page, perPage);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.per_page);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.productService.getProductById(req.params.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.productService.getProductBySlug(req.params.slug);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  compareProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ids = (req.query.ids as string || '').split(',').filter(Boolean);
      const result = await this.productService.compareProducts(ids);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string || '';
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 20;
      const result = await this.productService.searchProducts(query, page, perPage);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.per_page);
    } catch (error) {
      next(error);
    }
  };

  getFeaturedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.productService.getFeaturedProducts(limit);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.productService.getCategories();
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.productService.getCategoryBySlug(req.params.slug);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getProductsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 20;
      const result = await this.productService.getProductsByCategory(req.params.slug, page, perPage);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.per_page);
    } catch (error) {
      next(error);
    }
  };

  getInsurers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.productService.getInsurers();
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
