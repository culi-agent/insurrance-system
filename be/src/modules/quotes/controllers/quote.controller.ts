import { Request, Response, NextFunction } from 'express';
import { QuoteService } from '../services/quote.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

export class QuoteController {
  private quoteService: QuoteService;

  constructor() {
    this.quoteService = new QuoteService();
  }

  generateMotorQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = (req as AuthenticatedRequest).user?.id;
      const result = await this.quoteService.generateMotorQuotes(req.body, customerId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  generateHealthQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = (req as AuthenticatedRequest).user?.id;
      const result = await this.quoteService.generateHealthQuotes(req.body, customerId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  generateTravelQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = (req as AuthenticatedRequest).user?.id;
      const result = await this.quoteService.generateTravelQuotes(req.body, customerId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getQuoteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.quoteService.getQuoteById(req.params.id);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getMyQuotes = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.id;
      const filters = {
        status: req.query.status as string,
        product_type: req.query.product_type as string,
        page: parseInt(req.query.page as string) || 1,
        per_page: parseInt(req.query.per_page as string) || 10,
      };
      const result = await this.quoteService.getCustomerQuotes(customerId, filters);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.per_page);
    } catch (error) {
      next(error);
    }
  };
}
