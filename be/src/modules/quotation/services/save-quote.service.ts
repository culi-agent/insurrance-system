/**
 * Save & Email Quote Service
 * Sprint 6: S6-04 - Allows saving quotes and emailing them
 */
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Quotation } from '../entities/Quotation';
import { NotFoundError } from '../../../shared/errors/AppError';
import { NotificationService } from '../../notifications/services/notification.service';
import { logger } from '../../../shared/utils/logger';

export class SaveQuoteService {
  private quotationRepo: Repository<Quotation>;

  constructor() {
    this.quotationRepo = AppDataSource.getRepository(Quotation);
  }

  /**
   * Save a quote for later (bookmark)
   */
  async saveQuote(quoteId: string, customerId: string): Promise<{ success: boolean; message: string }> {
    const quotation = await this.quotationRepo.findOne({
      where: { id: quoteId, customerId },
    });

    if (!quotation) {
      throw new NotFoundError('Báo giá không tìm thấy');
    }

    // Update metadata to mark as saved
    quotation.metadata = {
      ...quotation.metadata,
      is_saved: true,
      saved_at: new Date().toISOString(),
    };

    await this.quotationRepo.save(quotation);

    return { success: true, message: 'Báo giá đã được lưu' };
  }

  /**
   * Email quote to a recipient
   */
  async emailQuote(quoteId: string, customerId: string, recipientEmail: string): Promise<{ success: boolean; message: string }> {
    const quotation = await this.quotationRepo.findOne({
      where: { id: quoteId, customerId },
    });

    if (!quotation) {
      throw new NotFoundError('Báo giá không tìm thấy');
    }

    // Send email with quote details
    await NotificationService.sendNotification({
      event: 'order_created', // Reuse template
      recipient: {
        id: customerId,
        email: recipientEmail,
      },
      data: {
        quote_number: quotation.quoteNumber,
        insurance_type: quotation.insuranceType,
        total_premium: quotation.totalPremium,
        valid_until: quotation.validUntil,
      },
      channels: ['email'],
    });

    logger.info(`[SaveQuote] Quote ${quotation.quoteNumber} emailed to ${recipientEmail}`);

    return { success: true, message: `Báo giá đã gửi đến ${recipientEmail}` };
  }

  /**
   * Get saved quotes for customer
   */
  async getSavedQuotes(customerId: string, page = 1, perPage = 10) {
    const queryBuilder = this.quotationRepo
      .createQueryBuilder('q')
      .where('q.customerId = :customerId', { customerId })
      .andWhere("q.metadata->>'is_saved' = 'true'")
      .orderBy('q.createdAt', 'DESC')
      .skip((page - 1) * perPage)
      .take(perPage);

    const [quotes, total] = await queryBuilder.getManyAndCount();

    return {
      data: quotes.map((q) => ({
        id: q.id,
        quote_number: q.quoteNumber,
        insurance_type: q.insuranceType,
        premium: { total: q.totalPremium },
        status: q.status,
        valid_until: q.validUntil,
        saved_at: q.metadata?.saved_at,
        created_at: q.createdAt,
      })),
      total,
      page,
      per_page: perPage,
    };
  }

  /**
   * Remove saved quote
   */
  async unsaveQuote(quoteId: string, customerId: string): Promise<{ success: boolean }> {
    const quotation = await this.quotationRepo.findOne({
      where: { id: quoteId, customerId },
    });

    if (!quotation) {
      throw new NotFoundError('Báo giá không tìm thấy');
    }

    quotation.metadata = {
      ...quotation.metadata,
      is_saved: false,
      saved_at: undefined,
    };

    await this.quotationRepo.save(quotation);
    return { success: true };
  }
}
