import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Claim } from '../entities/Claim';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { NotificationService } from '../../notifications/services/notification.service';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface SettlementInput {
  bank_name: string;
  bank_branch?: string;
  account_number: string;
  account_holder: string;
}

export interface ClaimSettlement {
  id: string;
  claim_id: string;
  customer_id: string;
  settlement_amount: number;
  settlement_method: string;
  bank_name: string;
  bank_branch?: string;
  account_number: string;
  account_holder: string;
  status: string;
  transaction_ref?: string;
  initiated_at: Date;
  processed_at?: Date;
  completed_at?: Date;
}

export interface AppealInput {
  appeal_reason: string;
  supporting_documents?: Array<{ name: string; url: string; type: string }>;
}

const FAST_TRACK_THRESHOLD = 5000000; // 5M VND

export class SettlementService {
  private claimRepo: Repository<Claim>;

  constructor() {
    this.claimRepo = AppDataSource.getRepository(Claim);
  }

  /**
   * Initiate settlement for approved claim (bank transfer)
   */
  async initiateSettlement(claimId: string, input: SettlementInput): Promise<ClaimSettlement> {
    const claim = await this.claimRepo.findOne({ where: { id: claimId } });
    if (!claim) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');

    if (claim.status !== 'approved') {
      throw new ValidationError('Chỉ có thể thanh toán cho yêu cầu đã được chấp thuận');
    }

    if (!claim.approvedAmount || claim.approvedAmount <= 0) {
      throw new ValidationError('Số tiền bồi thường không hợp lệ');
    }

    // Create settlement record
    const settlementId = uuidv4();
    const transactionRef = this.generateTransactionRef();

    claim.settlementMethod = 'bank_transfer';
    claim.settlementAccount = {
      bank_name: input.bank_name,
      bank_branch: input.bank_branch,
      account_number: input.account_number,
      account_holder: input.account_holder,
    };
    claim.status = 'settlement_processing';

    claim.messages.push({
      id: uuidv4(),
      sender_type: 'system',
      sender_id: 'system',
      sender_name: 'Hệ thống',
      message: `Thanh toán bồi thường ${claim.approvedAmount?.toLocaleString('vi-VN')} VND đang được xử lý. Mã giao dịch: ${transactionRef}`,
      timestamp: new Date().toISOString(),
    });

    await this.claimRepo.save(claim);

    // Simulate bank transfer processing (in production: call bank API)
    await this.processBankTransfer(claim, transactionRef);

    logger.info(`[Settlement] Initiated for claim ${claim.claimNumber}, amount: ${claim.approvedAmount}`);

    return {
      id: settlementId,
      claim_id: claimId,
      customer_id: claim.customerId,
      settlement_amount: Number(claim.approvedAmount),
      settlement_method: 'bank_transfer',
      bank_name: input.bank_name,
      bank_branch: input.bank_branch,
      account_number: input.account_number,
      account_holder: input.account_holder,
      status: 'processing',
      transaction_ref: transactionRef,
      initiated_at: new Date(),
    };
  }

  /**
   * Fast-track auto-approve for claims < 5M VND
   */
  async fastTrackClaim(claimId: string): Promise<{ eligible: boolean; auto_approved: boolean; reason: string }> {
    const claim = await this.claimRepo.findOne({ where: { id: claimId } });
    if (!claim) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');

    if (claim.status !== 'submitted' && claim.status !== 'under_review') {
      return { eligible: false, auto_approved: false, reason: 'Claim không ở trạng thái phù hợp' };
    }

    const claimAmount = Number(claim.claimAmount || 0);

    // Check fast-track eligibility
    if (claimAmount <= 0) {
      return { eligible: false, auto_approved: false, reason: 'Số tiền yêu cầu không hợp lệ' };
    }

    if (claimAmount > FAST_TRACK_THRESHOLD) {
      return { eligible: false, auto_approved: false, reason: `Số tiền vượt ngưỡng fast-track (${FAST_TRACK_THRESHOLD.toLocaleString('vi-VN')} VND)` };
    }

    // Check documents are complete
    if (!claim.documents || claim.documents.length === 0) {
      return { eligible: false, auto_approved: false, reason: 'Thiếu tài liệu chứng từ' };
    }

    // Auto-approve
    claim.status = 'approved';
    claim.approvedAmount = claimAmount;
    claim.decidedBy = 'system_fast_track';
    claim.decidedAt = new Date();
    claim.decisionReason = `Tự động chấp thuận (fast-track): Số tiền ${claimAmount.toLocaleString('vi-VN')} VND < ngưỡng ${FAST_TRACK_THRESHOLD.toLocaleString('vi-VN')} VND`;

    claim.messages.push({
      id: uuidv4(),
      sender_type: 'system',
      sender_id: 'system',
      sender_name: 'Hệ thống',
      message: `Yêu cầu bồi thường được chấp thuận tự động (fast-track). Số tiền: ${claimAmount.toLocaleString('vi-VN')} VND`,
      timestamp: new Date().toISOString(),
    });

    await this.claimRepo.save(claim);

    // Notify customer
    await NotificationService.sendNotification({
      event: 'claim_approved',
      recipient: { id: claim.customerId },
      data: { claim_number: claim.claimNumber, amount: claimAmount },
      channels: ['email', 'sms'],
    });

    logger.info(`[FastTrack] Auto-approved claim ${claim.claimNumber}, amount: ${claimAmount}`);

    return { eligible: true, auto_approved: true, reason: 'Chấp thuận tự động thành công' };
  }

  /**
   * Submit appeal for rejected claim
   */
  async submitAppeal(claimId: string, customerId: string, input: AppealInput) {
    const claim = await this.claimRepo.findOne({ where: { id: claimId, customerId } });
    if (!claim) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');

    if (claim.status !== 'rejected') {
      throw new ValidationError('Chỉ có thể khiếu nại cho yêu cầu bị từ chối');
    }

    // Update claim status
    claim.status = 'appealed';
    claim.messages.push({
      id: uuidv4(),
      sender_type: 'customer',
      sender_id: customerId,
      sender_name: 'Khách hàng',
      message: `Khiếu nại: ${input.appeal_reason}`,
      timestamp: new Date().toISOString(),
    });

    // Add supporting documents if provided
    if (input.supporting_documents) {
      for (const doc of input.supporting_documents) {
        claim.documents.push({
          id: uuidv4(),
          name: doc.name,
          url: doc.url,
          type: doc.type,
          uploaded_at: new Date().toISOString(),
        });
      }
    }

    await this.claimRepo.save(claim);

    logger.info(`[Appeal] Submitted for claim ${claim.claimNumber}`);

    return {
      claim_id: claimId,
      claim_number: claim.claimNumber,
      appeal_status: 'submitted',
      appeal_reason: input.appeal_reason,
      message: 'Khiếu nại đã được tiếp nhận. Chúng tôi sẽ xem xét lại trong 5-7 ngày làm việc.',
    };
  }

  /**
   * Get settlement status for a claim
   */
  async getSettlementStatus(claimId: string, customerId: string) {
    const claim = await this.claimRepo.findOne({ where: { id: claimId, customerId } });
    if (!claim) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');

    return {
      claim_id: claimId,
      claim_number: claim.claimNumber,
      settlement_method: claim.settlementMethod,
      settlement_account: claim.settlementAccount,
      approved_amount: claim.approvedAmount,
      status: claim.status,
      settled_at: claim.settledAt,
    };
  }

  /**
   * Process bank transfer (simulated)
   */
  private async processBankTransfer(claim: Claim, transactionRef: string): Promise<void> {
    // In production: integrate with bank API (Napas, VNPAY disbursement, etc.)
    // Simulating async processing

    // Mark as settled
    claim.status = 'settled';
    claim.settledAt = new Date();

    claim.messages.push({
      id: uuidv4(),
      sender_type: 'system',
      sender_id: 'system',
      sender_name: 'Hệ thống',
      message: `Chuyển khoản bồi thường ${claim.approvedAmount?.toLocaleString('vi-VN')} VND đã hoàn tất. Mã GD: ${transactionRef}`,
      timestamp: new Date().toISOString(),
    });

    await this.claimRepo.save(claim);

    logger.info(`[Settlement] Completed for claim ${claim.claimNumber}, ref: ${transactionRef}`);
  }

  private generateTransactionRef(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `STL-${timestamp}-${random}`;
  }
}
