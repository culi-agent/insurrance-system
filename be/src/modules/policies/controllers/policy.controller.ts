import { Response, NextFunction } from 'express';
import { PolicyService } from '../services/policy.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

export class PolicyController {
  private policyService: PolicyService;

  constructor() {
    this.policyService = new PolicyService();
  }

  createPolicy = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.id;
      const result = await this.policyService.createFromQuote({
        ...req.body,
        customer_id: customerId,
      });
      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  activatePolicy = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.policyService.activatePolicy(
        req.params.id,
        req.body.payment_id,
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  cancelPolicy = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.id;
      const result = await this.policyService.cancelPolicy(
        req.params.id,
        customerId,
        req.body.reason,
      );
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getMyPolicies = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.id;
      const filters = {
        status: req.query.status as string,
        product_type: req.query.product_type as string,
        page: parseInt(req.query.page as string) || 1,
        per_page: parseInt(req.query.per_page as string) || 10,
      };
      const result = await this.policyService.getCustomerPolicies(customerId, filters);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.per_page);
    } catch (error) {
      next(error);
    }
  };

  getPolicyById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.id;
      const result = await this.policyService.getPolicyById(req.params.id, customerId);
      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
