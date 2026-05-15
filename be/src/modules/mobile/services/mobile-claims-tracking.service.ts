import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface ClaimTimelineEvent {
  id: string;
  event_type: 'submitted' | 'document_received' | 'under_review' | 'info_requested' | 'processing' | 'approved' | 'rejected' | 'settled' | 'message';
  title: string;
  description: string;
  created_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

export interface ClaimDetailMobile {
  claim_id: string;
  claim_number: string;
  policy_number: string;
  product_name: string;
  insurance_type: string;
  insurer_name: string;
  status: string;
  status_label: string;
  claim_type: string;
  incident_date: string;
  incident_description: string;
  claim_amount: number;
  approved_amount?: number;
  progress_percentage: number;
  timeline: ClaimTimelineEvent[];
  documents_count: number;
  messages_count: number;
  estimated_completion?: string;
  handler_name?: string;
  can_add_documents: boolean;
  can_send_message: boolean;
  can_withdraw: boolean;
}

export interface ClaimMessage {
  id: string;
  sender_type: 'customer' | 'handler' | 'system';
  sender_name: string;
  message: string;
  attachments?: Array<{ filename: string; url: string }>;
  created_at: string;
  is_read: boolean;
}

export class MobileClaimsTrackingService {
  /**
   * Get claim detail with timeline for mobile
   */
  async getClaimDetail(customerId: string, claimId: string): Promise<ClaimDetailMobile> {
    const claim = await AppDataSource.query(`
      SELECT c.*, p.policy_number, pr.name as product_name, pr.insurance_type,
             COALESCE(i.name, 'N/A') as insurer_name
      FROM claim c
      JOIN policy p ON c.policy_id = p.id
      JOIN product pr ON p.product_id = pr.id
      LEFT JOIN insurer i ON c.insurer_id = i.id
      WHERE c.id = $1 AND c.customer_id = $2
    `, [claimId, customerId]);

    if (claim.length === 0) {
      throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');
    }

    const c = claim[0];

    // Get timeline events
    const timeline = await this.getTimeline(claimId);

    // Get counts
    const [docCount, msgCount] = await Promise.all([
      AppDataSource.query(`SELECT COUNT(*) as count FROM claim_document WHERE claim_id = $1`, [claimId]),
      AppDataSource.query(`SELECT COUNT(*) as count FROM claim_message WHERE claim_id = $1`, [claimId]),
    ]);

    const status = c.status;
    const canModify = !['settled', 'rejected', 'withdrawn'].includes(status);

    return {
      claim_id: c.id,
      claim_number: c.claim_number,
      policy_number: c.policy_number,
      product_name: c.product_name,
      insurance_type: c.insurance_type,
      insurer_name: c.insurer_name,
      status,
      status_label: this.getStatusLabel(status),
      claim_type: c.claim_type,
      incident_date: c.incident_date,
      incident_description: c.incident_description,
      claim_amount: parseFloat(c.claim_amount),
      approved_amount: c.approved_amount ? parseFloat(c.approved_amount) : undefined,
      progress_percentage: this.getProgressPercentage(status),
      timeline,
      documents_count: parseInt(docCount[0]?.count) || 0,
      messages_count: parseInt(msgCount[0]?.count) || 0,
      estimated_completion: this.estimateCompletion(c.created_at, status),
      handler_name: c.handler_name || undefined,
      can_add_documents: canModify,
      can_send_message: canModify,
      can_withdraw: ['submitted', 'under_review'].includes(status),
    };
  }

  /**
   * Get claim timeline/history
   */
  async getTimeline(claimId: string): Promise<ClaimTimelineEvent[]> {
    const events = await AppDataSource.query(`
      SELECT id, event_type, title, description, created_at, created_by, metadata
      FROM claim_timeline
      WHERE claim_id = $1
      ORDER BY created_at ASC
    `, [claimId]);

    if (events.length === 0) {
      // Generate timeline from claim status history
      return this.generateTimelineFromStatus(claimId);
    }

    return events.map((e: any) => ({
      id: e.id,
      event_type: e.event_type,
      title: e.title,
      description: e.description,
      created_at: e.created_at,
      created_by: e.created_by,
      metadata: e.metadata,
    }));
  }

  /**
   * Get messages/communication thread for a claim
   */
  async getMessages(customerId: string, claimId: string, page: number = 1, limit: number = 50): Promise<{ messages: ClaimMessage[]; total: number }> {
    // Verify claim ownership
    const claim = await AppDataSource.query(
      `SELECT id FROM claim WHERE id = $1 AND customer_id = $2`, [claimId, customerId]
    );
    if (claim.length === 0) throw new NotFoundError('Yêu cầu không tìm thấy');

    const offset = (page - 1) * limit;

    const [messages, countResult] = await Promise.all([
      AppDataSource.query(`
        SELECT id, sender_type, sender_name, message, attachments, created_at, is_read
        FROM claim_message
        WHERE claim_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [claimId, limit, offset]),
      AppDataSource.query(`SELECT COUNT(*) as total FROM claim_message WHERE claim_id = $1`, [claimId]),
    ]);

    // Mark messages from handler as read
    await AppDataSource.query(
      `UPDATE claim_message SET is_read = true WHERE claim_id = $1 AND sender_type != 'customer' AND is_read = false`,
      [claimId]
    );

    return {
      messages: messages.map((m: any) => ({
        id: m.id,
        sender_type: m.sender_type,
        sender_name: m.sender_name,
        message: m.message,
        attachments: m.attachments,
        created_at: m.created_at,
        is_read: m.is_read,
      })),
      total: parseInt(countResult[0]?.total) || 0,
    };
  }

  /**
   * Send message in claim thread
   */
  async sendMessage(customerId: string, claimId: string, message: string, attachments?: Array<{ filename: string; url: string }>): Promise<ClaimMessage> {
    const claim = await AppDataSource.query(
      `SELECT id, status FROM claim WHERE id = $1 AND customer_id = $2`, [claimId, customerId]
    );
    if (claim.length === 0) throw new NotFoundError('Yêu cầu không tìm thấy');

    const customer = await AppDataSource.query(
      `SELECT full_name FROM customer WHERE id = $1`, [customerId]
    );

    const msgId = require('uuid').v4();
    await AppDataSource.query(
      `INSERT INTO claim_message (id, claim_id, sender_type, sender_name, message, attachments, is_read, created_at)
       VALUES ($1, $2, 'customer', $3, $4, $5, true, NOW())`,
      [msgId, claimId, customer[0]?.full_name || 'Khách hàng', message, JSON.stringify(attachments || [])]
    );

    return {
      id: msgId,
      sender_type: 'customer',
      sender_name: customer[0]?.full_name || 'Khách hàng',
      message,
      attachments,
      created_at: new Date().toISOString(),
      is_read: true,
    };
  }

  /**
   * Withdraw/cancel claim
   */
  async withdrawClaim(customerId: string, claimId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const claim = await AppDataSource.query(
      `SELECT id, status, claim_number FROM claim WHERE id = $1 AND customer_id = $2`,
      [claimId, customerId]
    );

    if (claim.length === 0) throw new NotFoundError('Yêu cầu không tìm thấy');
    if (!['submitted', 'under_review'].includes(claim[0].status)) {
      return { success: false, message: 'Không thể rút yêu cầu ở trạng thái hiện tại' };
    }

    await AppDataSource.query(
      `UPDATE claim SET status = 'withdrawn', withdrawal_reason = $1, updated_at = NOW() WHERE id = $2`,
      [reason, claimId]
    );

    logger.info(`[Claims] Withdrawn: ${claim[0].claim_number} by customer ${customerId}`);
    return { success: true, message: 'Đã rút yêu cầu bồi thường thành công' };
  }

  /**
   * Get unread messages count for all claims
   */
  async getUnreadMessagesCount(customerId: string): Promise<number> {
    const result = await AppDataSource.query(`
      SELECT COUNT(*) as count
      FROM claim_message cm
      JOIN claim c ON cm.claim_id = c.id
      WHERE c.customer_id = $1 AND cm.sender_type != 'customer' AND cm.is_read = false
    `, [customerId]);

    return parseInt(result[0]?.count) || 0;
  }

  // ============ Private Methods ============

  private async generateTimelineFromStatus(claimId: string): Promise<ClaimTimelineEvent[]> {
    const claim = await AppDataSource.query(
      `SELECT status, created_at, updated_at FROM claim WHERE id = $1`, [claimId]
    );
    if (claim.length === 0) return [];

    const c = claim[0];
    const timeline: ClaimTimelineEvent[] = [];
    const statuses = this.getStatusSequence(c.status);

    timeline.push({
      id: `${claimId}-submitted`,
      event_type: 'submitted',
      title: 'Yêu cầu đã được nộp',
      description: 'Hệ thống đã tiếp nhận yêu cầu bồi thường của bạn',
      created_at: c.created_at,
    });

    if (statuses.includes('under_review')) {
      timeline.push({
        id: `${claimId}-review`,
        event_type: 'under_review',
        title: 'Đang xem xét hồ sơ',
        description: 'Chuyên viên đang kiểm tra tài liệu và thông tin',
        created_at: c.created_at, // Would be from status history in production
      });
    }

    if (statuses.includes('processing')) {
      timeline.push({
        id: `${claimId}-processing`,
        event_type: 'processing',
        title: 'Đang xử lý',
        description: 'Yêu cầu đang được xử lý và đánh giá',
        created_at: c.updated_at,
      });
    }

    if (c.status === 'approved') {
      timeline.push({
        id: `${claimId}-approved`,
        event_type: 'approved',
        title: 'Đã được duyệt',
        description: 'Yêu cầu bồi thường đã được chấp nhận',
        created_at: c.updated_at,
      });
    }

    if (c.status === 'settled') {
      timeline.push({
        id: `${claimId}-settled`,
        event_type: 'settled',
        title: 'Đã thanh toán',
        description: 'Tiền bồi thường đã được chuyển vào tài khoản',
        created_at: c.updated_at,
      });
    }

    if (c.status === 'rejected') {
      timeline.push({
        id: `${claimId}-rejected`,
        event_type: 'rejected',
        title: 'Từ chối',
        description: 'Yêu cầu không được chấp nhận',
        created_at: c.updated_at,
      });
    }

    return timeline;
  }

  private getStatusSequence(currentStatus: string): string[] {
    const fullSequence = ['submitted', 'under_review', 'processing', 'approved', 'settled'];
    const idx = fullSequence.indexOf(currentStatus);
    return idx >= 0 ? fullSequence.slice(0, idx + 1) : [currentStatus];
  }

  private getProgressPercentage(status: string): number {
    const map: Record<string, number> = {
      submitted: 20,
      under_review: 40,
      processing: 60,
      approved: 80,
      settled: 100,
      rejected: 100,
      withdrawn: 100,
    };
    return map[status] || 10;
  }

  private getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      submitted: 'Đã nộp',
      under_review: 'Đang xem xét',
      processing: 'Đang xử lý',
      approved: 'Đã duyệt',
      settled: 'Đã thanh toán',
      rejected: 'Từ chối',
      withdrawn: 'Đã rút',
    };
    return map[status] || status;
  }

  private estimateCompletion(createdAt: string, status: string): string | undefined {
    if (['settled', 'rejected', 'withdrawn'].includes(status)) return undefined;

    const created = new Date(createdAt);
    const daysToAdd = status === 'submitted' ? 10 : status === 'under_review' ? 7 : 5;
    const estimated = new Date(created.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    if (estimated < new Date()) {
      // If past estimated, add 3 more days from now
      return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    }

    return estimated.toISOString();
  }
}
