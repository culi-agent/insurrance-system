import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Claim } from '../entities/Claim';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { NotificationService } from '../../notifications/services/notification.service';
import { v4 as uuidv4 } from 'uuid';

export interface SubmitClaimInput {
  policy_id: string;
  claim_type: string;
  incident_date: string;
  incident_description: string;
  claim_amount?: number;
  documents?: Array<{ name: string; url: string; type: string }>;
}

export interface ClaimMessageInput {
  message: string;
}

export class ClaimsService {
  private claimRepo: Repository<Claim>;

  constructor() {
    this.claimRepo = AppDataSource.getRepository(Claim);
  }

  /**
   * Submit a new claim
   */
  async submitClaim(customerId: string, input: SubmitClaimInput) {
    const claimNumber = this.generateClaimNumber();

    const claim = this.claimRepo.create({
      claimNumber,
      policyId: input.policy_id,
      customerId,
      insuranceType: 'general', // Would be determined from policy
      claimType: input.claim_type,
      incidentDate: new Date(input.incident_date),
      incidentDescription: input.incident_description,
      claimAmount: input.claim_amount,
      status: 'submitted',
      priority: 'normal',
      documents: (input.documents || []).map(doc => ({
        id: uuidv4(),
        name: doc.name,
        url: doc.url,
        type: doc.type,
        uploaded_at: new Date().toISOString(),
      })),
      messages: [{
        id: uuidv4(),
        sender_type: 'system',
        sender_id: 'system',
        sender_name: 'Hệ thống',
        message: `Yêu cầu bồi thường ${claimNumber} đã được tiếp nhận. Chúng tôi sẽ xem xét trong 3-5 ngày làm việc.`,
        timestamp: new Date().toISOString(),
      }],
      submittedAt: new Date(),
    });

    const saved = await this.claimRepo.save(claim);

    // Send notification
    await NotificationService.sendNotification({
      event: 'claim_submitted',
      recipient: { id: customerId },
      data: { claim_number: claimNumber },
      channels: ['email', 'sms'],
    });

    return this.formatClaim(saved);
  }

  /**
   * Get claim by ID
   */
  async getClaimById(claimId: string, customerId?: string) {
    const where: any = { id: claimId };
    if (customerId) where.customerId = customerId;

    const claim = await this.claimRepo.findOne({ where });
    if (!claim) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');
    return this.formatClaim(claim);
  }

  /**
   * Get customer's claims
   */
  async getCustomerClaims(customerId: string, page = 1, perPage = 10, status?: string) {
    const where: any = { customerId };
    if (status) where.status = status;

    const [claims, total] = await this.claimRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return { data: claims.map(this.formatClaim), total, page, per_page: perPage };
  }

  /**
   * Upload document to claim
   */
  async uploadDocument(claimId: string, customerId: string, document: { name: string; url: string; type: string }) {
    const claim = await this.claimRepo.findOne({ where: { id: claimId, customerId } });
    if (!claim) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');

    claim.documents.push({
      id: uuidv4(),
      name: document.name,
      url: document.url,
      type: document.type,
      uploaded_at: new Date().toISOString(),
    });

    await this.claimRepo.save(claim);
    return { success: true, documents: claim.documents };
  }

  /**
   * Add message to claim communication thread
   */
  async addMessage(claimId: string, senderId: string, senderName: string, senderType: string, message: string) {
    const claim = await this.claimRepo.findOne({ where: { id: claimId } });
    if (!claim) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');

    claim.messages.push({
      id: uuidv4(),
      sender_type: senderType,
      sender_id: senderId,
      sender_name: senderName,
      message,
      timestamp: new Date().toISOString(),
    });

    await this.claimRepo.save(claim);
    return { success: true, messages: claim.messages };
  }

  // ===== ADMIN METHODS =====

  /**
   * Get all claims (admin queue)
   */
  async getClaimsQueue(page = 1, perPage = 20, status?: string, priority?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [claims, total] = await this.claimRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return { data: claims.map(this.formatClaim), total, page, per_page: perPage };
  }

  /**
   * Assign claim to handler
   */
  async assignClaim(claimId: string, assigneeId: string) {
    const claim = await this.claimRepo.findOne({ where: { id: claimId } });
    if (!claim) throw new NotFoundError('Claim không tìm thấy');

    claim.assignedTo = assigneeId;
    claim.status = 'under_review';

    claim.messages.push({
      id: uuidv4(),
      sender_type: 'system',
      sender_id: 'system',
      sender_name: 'Hệ thống',
      message: 'Yêu cầu đã được phân công cho nhân viên xử lý.',
      timestamp: new Date().toISOString(),
    });

    await this.claimRepo.save(claim);
    return this.formatClaim(claim);
  }

  /**
   * Assess and decide claim
   */
  async decideClaim(claimId: string, decidedBy: string, decision: 'approved' | 'rejected', data: {
    approved_amount?: number;
    reason: string;
    assessment?: Record<string, any>;
  }) {
    const claim = await this.claimRepo.findOne({ where: { id: claimId } });
    if (!claim) throw new NotFoundError('Claim không tìm thấy');

    claim.status = decision;
    claim.decidedBy = decidedBy;
    claim.decidedAt = new Date();
    claim.decisionReason = data.reason;
    claim.assessment = data.assessment || {};

    if (decision === 'approved') {
      claim.approvedAmount = data.approved_amount || claim.claimAmount;
    }

    claim.messages.push({
      id: uuidv4(),
      sender_type: 'agent',
      sender_id: decidedBy,
      sender_name: 'Nhân viên xử lý',
      message: decision === 'approved'
        ? `Yêu cầu bồi thường đã được chấp thuận. Số tiền: ${claim.approvedAmount?.toLocaleString('vi-VN')} VND`
        : `Yêu cầu bồi thường bị từ chối. Lý do: ${data.reason}`,
      timestamp: new Date().toISOString(),
    });

    await this.claimRepo.save(claim);

    // Send notification
    await NotificationService.sendNotification({
      event: decision === 'approved' ? 'claim_approved' : 'claim_rejected',
      recipient: { id: claim.customerId },
      data: { claim_number: claim.claimNumber, amount: claim.approvedAmount, reason: data.reason },
    });

    return this.formatClaim(claim);
  }

  private generateClaimNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `CLM-${timestamp}-${random}`;
  }

  private formatClaim(claim: Claim) {
    return {
      id: claim.id,
      claim_number: claim.claimNumber,
      policy_id: claim.policyId,
      insurance_type: claim.insuranceType,
      claim_type: claim.claimType,
      incident_date: claim.incidentDate,
      incident_description: claim.incidentDescription,
      claim_amount: claim.claimAmount,
      approved_amount: claim.approvedAmount,
      status: claim.status,
      priority: claim.priority,
      assigned_to: claim.assignedTo,
      documents: claim.documents,
      messages: claim.messages,
      decision_reason: claim.decisionReason,
      settlement_method: claim.settlementMethod,
      submitted_at: claim.submittedAt,
      decided_at: claim.decidedAt,
      created_at: claim.createdAt,
    };
  }
}
