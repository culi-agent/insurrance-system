import { Response, NextFunction } from 'express';
import { SmartPrefillService } from '../services/smart-prefill.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';

const smartPrefillService = new SmartPrefillService();

export class SmartPrefillController {
  /**
   * Get pre-fill data for quote form
   */
  static async getPrefillData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const insuranceType = req.query.insurance_type as string | undefined;
      const result = await smartPrefillService.getPrefillData(customerId, insuranceType);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save form data for future pre-fill learning
   */
  static async saveFormData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { insurance_type, form_data } = req.body;
      await smartPrefillService.saveFormData(customerId, insurance_type, form_data);
      return ApiResponse.success(res, { message: 'Đã lưu dữ liệu form' });
    } catch (error) {
      next(error);
    }
  }
}
