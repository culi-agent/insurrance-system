import { Response, NextFunction } from 'express';
import { BeneficiaryService } from '../services/beneficiary.service';
import { InstallmentService } from '../services/installment.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const beneficiaryService = new BeneficiaryService();
const installmentService = new InstallmentService();

export class BeneficiaryController {
  // Beneficiary endpoints
  static async setBeneficiaries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId } = req.params;
      const result = await beneficiaryService.setBeneficiaries(policyId, customerId, req.body.beneficiaries);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async getBeneficiaries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId } = req.params;
      const result = await beneficiaryService.getBeneficiaries(policyId, customerId);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async updateBeneficiary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId, beneficiaryId } = req.params;
      const result = await beneficiaryService.updateBeneficiary(policyId, customerId, beneficiaryId, req.body);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async removeBeneficiary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId, beneficiaryId } = req.params;
      const result = await beneficiaryService.removeBeneficiary(policyId, customerId, beneficiaryId);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  // Installment endpoints
  static async createInstallmentPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const result = await installmentService.createInstallmentPlan(customerId, req.body);
      return ApiResponse.created(res, result);
    } catch (error) { next(error); }
  }

  static async getInstallmentPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { policyId } = req.params;
      const result = await installmentService.getInstallmentPlan(policyId, customerId);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { planId } = req.params;
      const { transaction_ref } = req.body;
      const result = await installmentService.recordPayment(planId, customerId, transaction_ref);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }
}
