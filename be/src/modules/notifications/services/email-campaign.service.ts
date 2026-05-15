import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_id: string;
  segment_id?: string;
  segment_name?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  recipient_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  unsubscribed_count: number;
  open_rate: number;
  click_rate: number;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
}

export interface CreateCampaignInput {
  name: string;
  subject: string;
  template_id: string;
  segment_id?: string;
  customer_ids?: string[];
  personalization: CampaignPersonalization;
  schedule?: string; // ISO datetime
  ab_test?: {
    enabled: boolean;
    variants: Array<{ subject: string; percentage: number }>;
  };
}

export interface CampaignPersonalization {
  type: 'renewal_reminder' | 'cross_sell' | 'welcome' | 'birthday' | 'reactivation' | 'promotion' | 'custom';
  dynamic_fields: Record<string, string>; // field_name -> data_source
  product_recommendation: boolean;
  include_name: boolean;
  include_policy_info: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject_template: string;
  html_template: string;
  category: string;
  variables: string[];
  created_at: string;
}

export class EmailCampaignService {
  /**
   * Create a new email campaign
   */
  async createCampaign(input: CreateCampaignInput): Promise<EmailCampaign> {
    const id = uuidv4();

    // Calculate recipient count
    let recipientCount = 0;
    if (input.customer_ids && input.customer_ids.length > 0) {
      recipientCount = input.customer_ids.length;
    } else if (input.segment_id) {
      const count = await AppDataSource.query(
        `SELECT customer_count FROM customer_segment WHERE id = $1`, [input.segment_id]
      );
      recipientCount = parseInt(count[0]?.customer_count) || 0;
    }

    const status = input.schedule ? 'scheduled' : 'draft';

    await AppDataSource.query(
      `INSERT INTO email_campaign (id, name, subject, template_id, segment_id, customer_ids, personalization, status, recipient_count, scheduled_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [id, input.name, input.subject, input.template_id, input.segment_id || null, JSON.stringify(input.customer_ids || []), JSON.stringify(input.personalization), status, recipientCount, input.schedule || null]
    );

    logger.info(`[Campaign] Created: ${input.name}, recipients=${recipientCount}, status=${status}`);

    return {
      id,
      name: input.name,
      subject: input.subject,
      template_id: input.template_id,
      segment_id: input.segment_id,
      status,
      recipient_count: recipientCount,
      sent_count: 0,
      opened_count: 0,
      clicked_count: 0,
      unsubscribed_count: 0,
      open_rate: 0,
      click_rate: 0,
      scheduled_at: input.schedule,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Send campaign (or start sending)
   */
  async sendCampaign(campaignId: string): Promise<{ status: string; message: string }> {
    const campaign = await AppDataSource.query(
      `SELECT * FROM email_campaign WHERE id = $1`, [campaignId]
    );

    if (campaign.length === 0) return { status: 'error', message: 'Campaign không tìm thấy' };
    if (!['draft', 'scheduled'].includes(campaign[0].status)) {
      return { status: 'error', message: 'Campaign không thể gửi ở trạng thái hiện tại' };
    }

    // Get recipients
    const recipients = await this.getRecipients(campaign[0]);

    // Update status to sending
    await AppDataSource.query(
      `UPDATE email_campaign SET status = 'sending', sent_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [campaignId]
    );

    // Process emails (in production, this would be queued)
    let sentCount = 0;
    for (const recipient of recipients) {
      try {
        const personalizedContent = await this.personalizeEmail(campaign[0], recipient);
        await this.sendEmail(recipient.email, personalizedContent.subject, personalizedContent.html);
        sentCount++;

        // Save send record
        await AppDataSource.query(
          `INSERT INTO email_send_log (id, campaign_id, customer_id, email, status, sent_at)
           VALUES (gen_random_uuid(), $1, $2, $3, 'sent', NOW())`,
          [campaignId, recipient.id, recipient.email]
        );
      } catch (error) {
        await AppDataSource.query(
          `INSERT INTO email_send_log (id, campaign_id, customer_id, email, status, error, sent_at)
           VALUES (gen_random_uuid(), $1, $2, $3, 'failed', $4, NOW())`,
          [campaignId, recipient.id, recipient.email, (error as Error).message]
        );
      }
    }

    // Update campaign stats
    await AppDataSource.query(
      `UPDATE email_campaign SET status = 'sent', sent_count = $1, updated_at = NOW() WHERE id = $2`,
      [sentCount, campaignId]
    );

    logger.info(`[Campaign] Sent: ${campaignId}, sent=${sentCount}/${recipients.length}`);
    return { status: 'success', message: `Đã gửi ${sentCount}/${recipients.length} emails` };
  }

  /**
   * Get campaign stats
   */
  async getCampaignStats(campaignId: string): Promise<EmailCampaign | null> {
    const campaign = await AppDataSource.query(
      `SELECT * FROM email_campaign WHERE id = $1`, [campaignId]
    );
    if (campaign.length === 0) return null;

    const c = campaign[0];
    const sentCount = c.sent_count || 0;

    return {
      id: c.id,
      name: c.name,
      subject: c.subject,
      template_id: c.template_id,
      segment_id: c.segment_id,
      segment_name: c.segment_name,
      status: c.status,
      recipient_count: c.recipient_count,
      sent_count: sentCount,
      opened_count: c.opened_count || 0,
      clicked_count: c.clicked_count || 0,
      unsubscribed_count: c.unsubscribed_count || 0,
      open_rate: sentCount > 0 ? Math.round(((c.opened_count || 0) / sentCount) * 100) : 0,
      click_rate: sentCount > 0 ? Math.round(((c.clicked_count || 0) / sentCount) * 100) : 0,
      scheduled_at: c.scheduled_at,
      sent_at: c.sent_at,
      created_at: c.created_at,
    };
  }

  /**
   * List campaigns
   */
  async listCampaigns(page: number = 1, limit: number = 20, status?: string): Promise<{ campaigns: EmailCampaign[]; total: number }> {
    const offset = (page - 1) * limit;
    let where = '';
    const params: any[] = [limit, offset];

    if (status) {
      where = `WHERE status = $3`;
      params.push(status);
    }

    const [campaigns, countResult] = await Promise.all([
      AppDataSource.query(
        `SELECT * FROM email_campaign ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        params
      ),
      AppDataSource.query(`SELECT COUNT(*) as total FROM email_campaign ${status ? `WHERE status = $1` : ''}`, status ? [status] : []),
    ]);

    return {
      campaigns: campaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        template_id: c.template_id,
        segment_id: c.segment_id,
        status: c.status,
        recipient_count: c.recipient_count,
        sent_count: c.sent_count || 0,
        opened_count: c.opened_count || 0,
        clicked_count: c.clicked_count || 0,
        unsubscribed_count: c.unsubscribed_count || 0,
        open_rate: c.sent_count > 0 ? Math.round(((c.opened_count || 0) / c.sent_count) * 100) : 0,
        click_rate: c.sent_count > 0 ? Math.round(((c.clicked_count || 0) / c.sent_count) * 100) : 0,
        scheduled_at: c.scheduled_at,
        sent_at: c.sent_at,
        created_at: c.created_at,
      })),
      total: parseInt(countResult[0]?.total) || 0,
    };
  }

  /**
   * Track email open
   */
  async trackOpen(campaignId: string, customerId: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE email_send_log SET opened_at = NOW() WHERE campaign_id = $1 AND customer_id = $2 AND opened_at IS NULL`,
      [campaignId, customerId]
    );
    await AppDataSource.query(
      `UPDATE email_campaign SET opened_count = opened_count + 1 WHERE id = $1`,
      [campaignId]
    );
  }

  /**
   * Track email click
   */
  async trackClick(campaignId: string, customerId: string, link: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE email_send_log SET clicked_at = NOW(), clicked_link = $3 WHERE campaign_id = $1 AND customer_id = $2`,
      [campaignId, customerId, link]
    );
    await AppDataSource.query(
      `UPDATE email_campaign SET clicked_count = clicked_count + 1 WHERE id = $1`,
      [campaignId]
    );
  }

  /**
   * Create/manage email templates
   */
  async createTemplate(name: string, subject: string, html: string, category: string): Promise<EmailTemplate> {
    const id = uuidv4();
    const variables = this.extractVariables(html);

    await AppDataSource.query(
      `INSERT INTO email_template (id, name, subject_template, html_template, category, variables, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, name, subject, html, category, JSON.stringify(variables)]
    );

    return { id, name, subject_template: subject, html_template: html, category, variables, created_at: new Date().toISOString() };
  }

  /**
   * List templates
   */
  async listTemplates(category?: string): Promise<EmailTemplate[]> {
    let query = `SELECT id, name, subject_template, category, variables, created_at FROM email_template`;
    const params: any[] = [];
    if (category) {
      query += ` WHERE category = $1`;
      params.push(category);
    }
    query += ` ORDER BY created_at DESC`;

    const templates = await AppDataSource.query(query, params);
    return templates.map((t: any) => ({
      id: t.id,
      name: t.name,
      subject_template: t.subject_template,
      html_template: '', // Don't return full HTML in list
      category: t.category,
      variables: t.variables || [],
      created_at: t.created_at,
    }));
  }

  // ============ Private Methods ============

  private async getRecipients(campaign: any): Promise<Array<{ id: string; email: string; full_name: string }>> {
    if (campaign.customer_ids && campaign.customer_ids.length > 0) {
      return AppDataSource.query(
        `SELECT id, email, full_name FROM customer WHERE id = ANY($1) AND email IS NOT NULL`,
        [campaign.customer_ids]
      );
    }

    if (campaign.segment_id) {
      // Get from segment criteria
      return AppDataSource.query(
        `SELECT c.id, c.email, c.full_name FROM customer c
         JOIN customer_rfm_score rfm ON rfm.customer_id = c.id
         WHERE c.email IS NOT NULL
         LIMIT 10000`
      );
    }

    return [];
  }

  private async personalizeEmail(campaign: any, recipient: any): Promise<{ subject: string; html: string }> {
    const personalization = campaign.personalization || {};
    let subject = campaign.subject;
    let html = '';

    // Get template
    const template = await AppDataSource.query(
      `SELECT html_template FROM email_template WHERE id = $1`, [campaign.template_id]
    );
    html = template[0]?.html_template || '<p>{{content}}</p>';

    // Replace variables
    subject = subject.replace('{{name}}', recipient.full_name || 'Quý khách');
    html = html.replace(/\{\{name\}\}/g, recipient.full_name || 'Quý khách');
    html = html.replace(/\{\{email\}\}/g, recipient.email || '');

    // Add personalized product recommendation if enabled
    if (personalization.product_recommendation) {
      const recommendation = await this.getEmailRecommendation(recipient.id);
      html = html.replace(/\{\{recommendation\}\}/g, recommendation);
    }

    // Policy info
    if (personalization.include_policy_info) {
      const policyInfo = await this.getLatestPolicyInfo(recipient.id);
      html = html.replace(/\{\{policy_info\}\}/g, policyInfo);
    }

    // Tracking pixel
    html += `<img src="/api/v1/campaigns/${campaign.id}/track/open?cid=${recipient.id}" width="1" height="1" style="display:none" />`;

    return { subject, html };
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    // In production, use SendGrid/SES/Mailgun
    logger.debug(`[Email] Sending to ${to}: ${subject}`);
    // await sendgrid.send({ to, from: 'no-reply@insurance-system.vn', subject, html });
  }

  private async getEmailRecommendation(customerId: string): Promise<string> {
    const policies = await AppDataSource.query(
      `SELECT pr.insurance_type FROM policy p JOIN product pr ON p.product_id = pr.id WHERE p.customer_id = $1`,
      [customerId]
    );
    const existingTypes = new Set(policies.map((p: any) => p.insurance_type));

    if (!existingTypes.has('health')) return '<p>💊 Bảo vệ sức khỏe với BH sức khỏe toàn diện - Chỉ từ 8 triệu/năm</p>';
    if (!existingTypes.has('life')) return '<p>🛡️ An tâm cho gia đình với BH nhân thọ - Bảo vệ 10x thu nhập</p>';
    return '<p>🌟 Khám phá các sản phẩm mới dành riêng cho bạn</p>';
  }

  private async getLatestPolicyInfo(customerId: string): Promise<string> {
    const policy = await AppDataSource.query(
      `SELECT policy_number, end_date FROM policy WHERE customer_id = $1 AND status = 'active' ORDER BY end_date ASC LIMIT 1`,
      [customerId]
    );
    if (policy.length === 0) return '';
    return `<p>Hợp đồng ${policy[0].policy_number} - Hết hạn: ${new Date(policy[0].end_date).toLocaleDateString('vi-VN')}</p>`;
  }

  private extractVariables(html: string): string[] {
    const matches = html.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  }
}
