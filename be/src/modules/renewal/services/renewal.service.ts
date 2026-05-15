import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Policy } from '../../purchase/entities/Policy';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { NotificationService } from '../../notifications/services/notification.service';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface RenewalInput {
  coverage_changes?: Record<string, any>;
  payment_method?: string;
}

export interface AutoRenewalInput {
  enabled: boolean;
  payment_method?: string;
}

export interface CancellationInput {
  reason: string;
  refund_method?: string;
}

export class RenewalService {
  private policyRepo: Repository<Policy>;

  constructor() {
    this.policyRepo = AppDataSource.getRepository(Policy);
  }

  /**
   * Renew policy (manual/online)
   */
  async renewPolicy(policyId: string, customerId: string, input: RenewalInput) {
    const policy = await this.policyRepo.findOne({ where: { id: policyId, customerId } });
    if (!policy) throw new NotFoundError('Hợp đồng không tìm thấy');

    if (policy.status === 'cancelled') {
      throw new ValidationError('Không thể gia hạn hợp đồng đã hủy');
    }

    // Calculate new dates
    const today = new Date();
    const newEffectiveDate = policy.expiryDate > today ? policy.expiryDate : today;
    const durationMonths = 12; // Default 12 months
    const newExpiryDate = new Date(newEffectiveDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + durationMonths);

    // Calculate renewal premium (may apply loyalty discount)
    const renewalCount = (policy.metadata?.renewal_count || 0) + 1;
    const loyaltyDiscount = this.calculateLoyaltyDiscount(renewalCount);
    const basePremium = Number(policy.premiumAmount);
    const discountAmount = basePremium * loyaltyDiscount;
    const newPremium = basePremium - discountAmount;

    // Create renewed policy
    const newPolicyNumber = this.generatePolicyNumber(policy.insuranceType);
    const newPolicy = this.policyRepo.create({
      policyNumber: newPolicyNumber,
      orderId: policy.orderId,
      customerId,
      productId: policy.productId,
      insurerId: policy.insurerId,
      insuranceType: policy.insuranceType,
      planName: policy.planName,
      coverageDetails: input.coverage_changes
        ? { ...policy.coverageDetails, ...input.coverage_changes }
        : policy.coverageDetails,
      insuredInfo: policy.insuredInfo,
      beneficiaryInfo: policy.beneficiaryInfo,
      premiumAmount: newPremium,
      paymentFrequency: policy.paymentFrequency,
      effectiveDate: newEffectiveDate,
      expiryDate: newExpiryDate,
      issuedDate: new Date(),
      status: 'active',
      signatureStatus: 'verified',
      renewedFromId: policy.id,
      metadata: {
        renewal_count: renewalCount,
        original_policy_id: policy.renewedFromId || policy.id,
        loyalty_discount: loyaltyDiscount,
        discount_amount: discountAmount,
      },
    });

    const savedNewPolicy = await this.policyRepo.save(newPolicy);

    // Update original policy
    policy.status = 'renewed';
    policy.metadata = {
      ...policy.metadata,
      renewed_to: savedNewPolicy.id,
      renewed_at: new Date().toISOString(),
    };
    await this.policyRepo.save(policy);

    // Send notification
    await NotificationService.sendNotification({
      event: 'policy_issued',
      recipient: { id: customerId },
      data: {
        policy_number: newPolicyNumber,
        old_policy_number: policy.policyNumber,
        effective_date: newEffectiveDate.toISOString().split('T')[0],
        expiry_date: newExpiryDate.toISOString().split('T')[0],
      },
      channels: ['email'],
    });

    logger.info(`[Renewal] Policy ${policy.policyNumber} renewed to ${newPolicyNumber}`);

    return {
      renewal_id: uuidv4(),
      original_policy: {
        id: policy.id,
        policy_number: policy.policyNumber,
        status: 'renewed',
      },
      new_policy: {
        id: savedNewPolicy.id,
        policy_number: newPolicyNumber,
        effective_date: newEffectiveDate,
        expiry_date: newExpiryDate,
        premium_amount: newPremium,
        loyalty_discount: loyaltyDiscount * 100,
        discount_amount: discountAmount,
      },
      status: 'completed',
    };
  }

  /**
   * Set/update auto-renewal preference
   */
  async setAutoRenewal(policyId: string, customerId: string, input: AutoRenewalInput) {
    const policy = await this.policyRepo.findOne({ where: { id: policyId, customerId } });
    if (!policy) throw new NotFoundError('Hợp đồng không tìm thấy');

    if (policy.status !== 'active') {
      throw new ValidationError('Chỉ có thể cài đặt gia hạn tự động cho hợp đồng đang hoạt động');
    }

    policy.metadata = {
      ...policy.metadata,
      auto_renewal: input.enabled,
      auto_renewal_payment_method: input.payment_method,
      auto_renewal_updated_at: new Date().toISOString(),
    };

    await this.policyRepo.save(policy);

    logger.info(`[AutoRenewal] ${input.enabled ? 'Enabled' : 'Disabled'} for policy ${policy.policyNumber}`);

    return {
      policy_id: policyId,
      policy_number: policy.policyNumber,
      auto_renewal: input.enabled,
      payment_method: input.payment_method,
      message: input.enabled
        ? 'Gia hạn tự động đã được bật. Hợp đồng sẽ tự động gia hạn trước khi hết hạn.'
        : 'Gia hạn tự động đã được tắt.',
    };
  }

  /**
   * Send renewal reminders for expiring policies
   * Called by cron job: check policies expiring in 30, 14, 7, 3, 1 days
   */
  async sendRenewalReminders(): Promise<{ sent: number; errors: number }> {
    const reminderDays = [30, 14, 7, 3, 1];
    let sent = 0;
    let errors = 0;

    for (const days of reminderDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Find policies expiring on target date
      const policies = await this.policyRepo
        .createQueryBuilder('policy')
        .where('policy.status = :status', { status: 'active' })
        .andWhere('DATE(policy.expiry_date) = :date', { date: targetDateStr })
        .getMany();

      for (const policy of policies) {
        try {
          await NotificationService.sendNotification({
            event: 'policy_renewal_reminder',
            recipient: { id: policy.customerId },
            data: {
              policy_number: policy.policyNumber,
              expiry_date: policy.expiryDate,
              days_remaining: days,
              insurance_type: policy.insuranceType,
              plan_name: policy.planName,
            },
            channels: days <= 3 ? ['email', 'sms'] : ['email'],
          });
          sent++;
        } catch (error) {
          errors++;
          logger.error(`[RenewalReminder] Failed for policy ${policy.policyNumber}:`, error);
        }
      }
    }

    logger.info(`[RenewalReminder] Sent ${sent} reminders, ${errors} errors`);
    return { sent, errors };
  }

  /**
   * Process auto-renewals for policies about to expire
   */
  async processAutoRenewals(): Promise<{ renewed: number; failed: number }> {
    let renewed = 0;
    let failed = 0;

    // Find active policies expiring tomorrow with auto-renewal enabled
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const policies = await this.policyRepo
      .createQueryBuilder('policy')
      .where('policy.status = :status', { status: 'active' })
      .andWhere('DATE(policy.expiry_date) = :date', { date: tomorrowStr })
      .getMany();

    for (const policy of policies) {
      if (!policy.metadata?.auto_renewal) continue;

      try {
        await this.renewPolicy(policy.id, policy.customerId, {
          payment_method: policy.metadata.auto_renewal_payment_method,
        });
        renewed++;
      } catch (error) {
        failed++;
        logger.error(`[AutoRenewal] Failed for policy ${policy.policyNumber}:`, error);
      }
    }

    logger.info(`[AutoRenewal] Processed: ${renewed} renewed, ${failed} failed`);
    return { renewed, failed };
  }

  /**
   * Cancel policy with pro-rata refund calculation
   */
  async cancelPolicy(policyId: string, customerId: string, input: CancellationInput) {
    const policy = await this.policyRepo.findOne({ where: { id: policyId, customerId } });
    if (!policy) throw new NotFoundError('Hợp đồng không tìm thấy');

    if (policy.status !== 'active') {
      throw new ValidationError('Chỉ có thể hủy hợp đồng đang hoạt động');
    }

    // Calculate pro-rata refund
    const today = new Date();
    const effectiveDate = new Date(policy.effectiveDate);
    const expiryDate = new Date(policy.expiryDate);

    const totalDays = Math.ceil((expiryDate.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysUsed = Math.ceil((today.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = totalDays - daysUsed;

    const dailyRate = Number(policy.premiumAmount) / totalDays;
    const refundAmount = Math.max(0, Math.round(dailyRate * daysRemaining));

    // Apply cancellation fee (10% of refund)
    const cancellationFee = Math.round(refundAmount * 0.1);
    const netRefund = refundAmount - cancellationFee;

    // Update policy
    policy.status = 'cancelled';
    policy.cancelledAt = new Date();
    policy.metadata = {
      ...policy.metadata,
      cancellation: {
        reason: input.reason,
        refund_amount: netRefund,
        cancellation_fee: cancellationFee,
        gross_refund: refundAmount,
        days_used: daysUsed,
        total_days: totalDays,
        daily_rate: dailyRate,
        cancelled_at: new Date().toISOString(),
        refund_method: input.refund_method || 'bank_transfer',
        refund_status: netRefund > 0 ? 'pending' : 'not_applicable',
      },
    };

    await this.policyRepo.save(policy);

    logger.info(`[Cancellation] Policy ${policy.policyNumber} cancelled. Refund: ${netRefund}`);

    return {
      policy_id: policyId,
      policy_number: policy.policyNumber,
      status: 'cancelled',
      refund: {
        eligible: netRefund > 0,
        gross_amount: refundAmount,
        cancellation_fee: cancellationFee,
        net_refund: netRefund,
        refund_method: input.refund_method || 'bank_transfer',
        refund_status: netRefund > 0 ? 'pending' : 'not_applicable',
        calculation: {
          total_days: totalDays,
          days_used: daysUsed,
          days_remaining: daysRemaining,
          daily_rate: Math.round(dailyRate),
        },
      },
      message: netRefund > 0
        ? `Hợp đồng đã hủy. Hoàn tiền ${netRefund.toLocaleString('vi-VN')} VND sẽ được xử lý trong 7-14 ngày.`
        : 'Hợp đồng đã hủy. Không đủ điều kiện hoàn tiền.',
    };
  }

  /**
   * Get policies eligible for renewal
   */
  async getEligibleForRenewal(customerId: string) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const policies = await this.policyRepo
      .createQueryBuilder('policy')
      .where('policy.customer_id = :customerId', { customerId })
      .andWhere('policy.status = :status', { status: 'active' })
      .andWhere('policy.expiry_date <= :date', { date: thirtyDaysFromNow })
      .orderBy('policy.expiry_date', 'ASC')
      .getMany();

    return policies.map(p => ({
      id: p.id,
      policy_number: p.policyNumber,
      insurance_type: p.insuranceType,
      plan_name: p.planName,
      expiry_date: p.expiryDate,
      premium_amount: p.premiumAmount,
      auto_renewal: p.metadata?.auto_renewal || false,
      days_until_expiry: Math.ceil(
        (new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  }

  private calculateLoyaltyDiscount(renewalCount: number): number {
    if (renewalCount >= 5) return 0.10; // 10% discount
    if (renewalCount >= 3) return 0.07; // 7% discount
    if (renewalCount >= 2) return 0.05; // 5% discount
    return 0.03; // 3% for first renewal
  }

  private generatePolicyNumber(insuranceType: string): string {
    const prefix = insuranceType.toUpperCase().slice(0, 3);
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `POL-${prefix}-${year}-${seq}`;
  }
}
