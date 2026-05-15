import { Request, Response, NextFunction } from 'express';
import { HomeInsurancePricingEngine, HomeInsuranceQuoteInput } from '../services/home-insurance.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';
import { AppDataSource } from '../../../config/database';
import { Quotation } from '../entities/Quotation';

export class HomeQuotationController {
  /**
   * Get quick home insurance quote (public)
   */
  static async getQuickQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const input: HomeInsuranceQuoteInput = req.body;
      const result = HomeInsurancePricingEngine.calculate(input);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Compare plans
   */
  static async comparePlans(req: Request, res: Response, next: NextFunction) {
    try {
      const { building_value, contents_value } = req.body;
      const plans = HomeInsurancePricingEngine.getPlansComparison(
        building_value || 2000000000,
        contents_value || 500000000
      );
      return ApiResponse.success(res, { plans });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create home insurance quotation (authenticated)
   */
  static async createQuote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const input: HomeInsuranceQuoteInput = req.body;

      const pricing = HomeInsurancePricingEngine.calculate(input);

      // Save quotation
      const quotationRepo = AppDataSource.getRepository(Quotation);
      const quotation = quotationRepo.create({
        quotationNumber: generateQuotationNumber(),
        customerId,
        insuranceType: 'property',
        productId: 'home-insurance',
        insurerId: 'bao-viet',
        status: 'quoted',
        quoteInput: input,
        basePremium: pricing.base_premium,
        tax: pricing.tax,
        totalPremium: pricing.total_premium,
        discount: pricing.discount_amount,
        sumAssured: input.building_value + input.contents_value,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: {
          pricing,
          property: {
            type: input.property_type,
            address: input.address,
            area: input.total_area_sqm,
            floors: input.floors,
          },
        },
      });

      const saved = await quotationRepo.save(quotation);

      return ApiResponse.created(res, {
        quotation_id: saved.id,
        quotation_number: saved.quotationNumber,
        pricing,
        valid_until: saved.validUntil,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get additional coverage options
   */
  static async getCoverageOptions(req: Request, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, {
        additional_coverages: [
          { code: 'flood', name: 'Ngập lụt', description: 'Bảo hiểm thiệt hại do ngập lụt, nước dâng' },
          { code: 'earthquake', name: 'Động đất', description: 'Bảo hiểm thiệt hại do động đất, sóng thần' },
          { code: 'theft', name: 'Trộm cắp', description: 'Bồi thường khi mất tài sản do trộm cắp' },
          { code: 'liability', name: 'Trách nhiệm dân sự', description: 'Bảo hiểm trách nhiệm với bên thứ 3' },
          { code: 'electrical', name: 'Hư hỏng điện', description: 'Bảo hiểm thiết bị điện do chập, quá tải' },
          { code: 'water_damage', name: 'Hư hỏng do nước', description: 'Vỡ ống nước, rò rỉ gây hư hại' },
          { code: 'glass_breakage', name: 'Vỡ kính', description: 'Bảo hiểm kính cửa sổ, vách kính' },
          { code: 'temporary_housing', name: 'Chi phí ở tạm', description: 'Chi trả tiền thuê nhà tạm khi sửa chữa' },
        ],
        security_features: [
          { code: 'cctv', name: 'Camera an ninh', discount: '3%' },
          { code: 'alarm', name: 'Hệ thống báo động', discount: '5%' },
          { code: 'guard', name: 'Bảo vệ 24/7', discount: '4%' },
          { code: 'fire_extinguisher', name: 'Bình chữa cháy', discount: '2%' },
          { code: 'smoke_detector', name: 'Đầu báo khói', discount: '3%' },
          { code: 'sprinkler', name: 'Hệ thống Sprinkler', discount: '5%' },
          { code: 'security_door', name: 'Cửa an ninh', discount: '2%' },
        ],
      });
    } catch (error) {
      next(error);
    }
  }
}

function generateQuotationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QUO-HOM-${timestamp}-${random}`;
}
