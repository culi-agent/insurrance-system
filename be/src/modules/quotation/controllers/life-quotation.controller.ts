import { Request, Response, NextFunction } from 'express';
import { LifeInsurancePricingEngine, LifeInsuranceQuoteInput, LIFE_RIDERS } from '../services/life-insurance.service';
import { LifeUnderwritingEngine, LifeUnderwritingInput } from '../services/life-underwriting.service';
import { ApiResponse } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/types';
import { AppDataSource } from '../../../config/database';
import { Quotation } from '../entities/Quotation';
import { v4 as uuidv4 } from 'uuid';

export class LifeQuotationController {
  /**
   * Get quick life insurance quote (public)
   */
  static async getQuickQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const input: LifeInsuranceQuoteInput = req.body;
      const result = LifeInsurancePricingEngine.calculate(input);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available riders
   */
  static async getRiders(req: Request, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, {
        riders: LIFE_RIDERS.map(r => ({
          code: r.code,
          name: r.name,
          max_sum_assured_ratio: r.max_sa_ratio,
          description: getRiderDescription(r.code),
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create life insurance quotation (authenticated)
   */
  static async createQuote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const input: LifeInsuranceQuoteInput = req.body;

      // Calculate premium
      const pricing = LifeInsurancePricingEngine.calculate(input);

      // Run pre-underwriting
      const age = calculateAge(input.date_of_birth);
      const bmi = input.weight_kg / Math.pow(input.height_cm / 100, 2);

      const uwInput: LifeUnderwritingInput = {
        age,
        gender: input.gender,
        smoking_status: input.smoking_status,
        occupation: input.occupation,
        occupation_class: input.occupation_class,
        annual_income: input.annual_income,
        height_cm: input.height_cm,
        weight_kg: input.weight_kg,
        bmi,
        health_conditions: input.health_conditions || [],
        family_medical_history: input.family_medical_history || [],
        sum_assured: input.sum_assured,
      };

      const underwriting = LifeUnderwritingEngine.evaluate(uwInput);

      // Save quotation
      const quotationRepo = AppDataSource.getRepository(Quotation);
      const quotation = quotationRepo.create({
        quotationNumber: generateQuotationNumber(),
        customerId,
        insuranceType: 'life',
        productId: 'life-endowment', // placeholder
        insurerId: 'dai-ichi', // placeholder
        status: underwriting.decision === 'declined' ? 'declined' : 'quoted',
        quoteInput: input,
        basePremium: pricing.total_premium,
        totalPremium: pricing.total_premium,
        sumAssured: input.sum_assured,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        metadata: {
          pricing,
          underwriting,
          riders: pricing.rider_premiums,
          illustration: pricing.illustration,
        },
      });

      const saved = await quotationRepo.save(quotation);

      return ApiResponse.created(res, {
        quotation_id: saved.id,
        quotation_number: saved.quotationNumber,
        pricing,
        underwriting: {
          decision: underwriting.decision,
          risk_class: underwriting.risk_class,
          premium_loading: underwriting.premium_loading,
          conditions: underwriting.conditions,
          exclusions: underwriting.exclusions,
          requires_medical_exam: underwriting.requires_medical_exam,
          required_documents: underwriting.required_documents,
        },
        valid_until: saved.validUntil,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get benefit illustration for a quotation
   */
  static async getIllustration(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { quotationId } = req.params;

      const quotationRepo = AppDataSource.getRepository(Quotation);
      const quotation = await quotationRepo.findOne({
        where: { id: quotationId, customerId },
      });

      if (!quotation) {
        return ApiResponse.error(res, 'NOT_FOUND', 'Báo giá không tìm thấy', 404);
      }

      const illustration = quotation.metadata?.illustration || quotation.metadata?.pricing?.illustration;

      if (!illustration) {
        // Regenerate
        const input = quotation.quoteInput as LifeInsuranceQuoteInput;
        const pricing = LifeInsurancePricingEngine.calculate(input);
        return ApiResponse.success(res, {
          quotation_id: quotation.id,
          quotation_number: quotation.quotationNumber,
          illustration: pricing.illustration,
        });
      }

      return ApiResponse.success(res, {
        quotation_id: quotation.id,
        quotation_number: quotation.quotationNumber,
        illustration,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Run underwriting assessment
   */
  static async runUnderwriting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input: LifeUnderwritingInput = req.body;
      const result = LifeUnderwritingEngine.evaluate(input);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get premium payment options
   */
  static async getPaymentOptions(req: Request, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, {
        policy_terms: [
          { value: 10, label: '10 năm' },
          { value: 15, label: '15 năm' },
          { value: 20, label: '20 năm' },
          { value: 25, label: '25 năm' },
          { value: 30, label: '30 năm' },
        ],
        premium_payment_terms: [
          { value: 5, label: '5 năm' },
          { value: 10, label: '10 năm' },
          { value: 15, label: '15 năm' },
          { value: 20, label: '20 năm' },
        ],
        payment_frequencies: [
          { value: 'annual', label: 'Hàng năm', discount: '0%' },
          { value: 'semi_annual', label: '6 tháng', discount: '+2%' },
          { value: 'quarterly', label: 'Hàng quý', discount: '+3%' },
          { value: 'monthly', label: 'Hàng tháng', discount: '+5%' },
        ],
      });
    } catch (error) {
      next(error);
    }
  }
}

// Helper functions
function getRiderDescription(code: string): string {
  const descriptions: Record<string, string> = {
    CI: 'Chi trả khi được chẩn đoán mắc 1 trong 30+ bệnh hiểm nghèo. Số tiền chi trả tối đa bằng STBH chính.',
    PA: 'Chi trả bồi thường khi xảy ra tai nạn dẫn đến tử vong hoặc thương tật. Tối đa 200% STBH chính.',
    WOP: 'Miễn đóng phí BH còn lại nếu NĐBH mất khả năng lao động do tai nạn hoặc bệnh tật.',
    HC: 'Chi trả tiền nằm viện hàng ngày khi NĐBH phải nhập viện điều trị. Tối đa 10% STBH chính.',
    TPD: 'Chi trả 100% STBH khi NĐBH bị thương tật toàn bộ vĩnh viễn do tai nạn hoặc bệnh tật.',
  };
  return descriptions[code] || '';
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function generateQuotationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QUO-LIF-${timestamp}-${random}`;
}
