import { Request, Response, NextFunction } from 'express';
import { QuotationService } from '../services/quotation.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

export class QuotationController {
  private quotationService: QuotationService;

  constructor() {
    this.quotationService = new QuotationService();
  }

  /**
   * Create a motor insurance quote (saved to DB)
   * POST /api/v1/quotations/motor
   */
  createMotorQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user?.id;
      const result = await this.quotationService.createMotorQuote(req.body, customerId);
      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get quick quote without saving (for anonymous users / quick comparison)
   * POST /api/v1/quotations/motor/quick
   */
  getQuickMotorQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.quotationService.getQuickMotorQuote(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get multi-insurer comparison quotes
   * POST /api/v1/quotations/motor/compare
   */
  getMultiInsurerQuotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.quotationService.getMultiInsurerQuotes(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a specific quotation by ID
   * GET /api/v1/quotations/:id
   */
  getQuotationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user?.id;
      const result = await this.quotationService.getQuotationById(req.params.id, customerId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer's quotation history
   * GET /api/v1/quotations/my
   */
  getMyQuotations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 10;
      const result = await this.quotationService.getCustomerQuotations(customerId, page, perPage);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.per_page);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Accept a quotation
   * POST /api/v1/quotations/:id/accept
   */
  acceptQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.id;
      const result = await this.quotationService.acceptQuote(req.params.id, customerId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a travel insurance quote (saved to DB)
   * POST /api/v1/quotations/travel
   */
  createTravelQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user?.id;
      const result = await this.quotationService.createTravelQuote(req.body, customerId);
      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get quick travel quote without saving
   * POST /api/v1/quotations/travel/quick
   */
  getQuickTravelQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.quotationService.getQuickTravelQuote(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get multi-insurer travel comparison quotes
   * POST /api/v1/quotations/travel/compare
   */
  getMultiInsurerTravelQuotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.quotationService.getMultiInsurerTravelQuotes(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a health insurance quote (saved)
   * POST /api/v1/quotations/health
   */
  createHealthQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user?.id;
      const result = await this.quotationService.createHealthQuote(req.body, customerId);
      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get quick health quote
   * POST /api/v1/quotations/health/quick
   */
  getQuickHealthQuote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.quotationService.getQuickHealthQuote(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get multi-insurer health quotes
   * POST /api/v1/quotations/health/compare
   */
  getMultiInsurerHealthQuotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.quotationService.getMultiInsurerHealthQuotes(req.body);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
