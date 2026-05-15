import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ScheduledNotification {
  id: string;
  type: 'renewal_reminder' | 'payment_due' | 'policy_expiry' | 'birthday' | 'custom';
  customer_id: string;
  policy_id?: string;
  channel: 'email' | 'sms' | 'push' | 'all';
  scheduled_at: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  template_data: Record<string, any>;
}

export interface RenewalReminderConfig {
  days_before_expiry: number[];  // e.g., [30, 14, 7, 3, 1]
  channels: ('email' | 'sms' | 'push')[];
  enabled: boolean;
}

export class ScheduledNotificationService {
  private defaultRenewalConfig: RenewalReminderConfig = {
    days_before_expiry: [30, 14, 7, 3, 1],
    channels: ['email', 'push'],
    enabled: true,
  };

  /**
   * Process all pending scheduled notifications (called by cron job)
   */
  async processScheduledNotifications(): Promise<{ processed: number; sent: number; failed: number }> {
    const pending = await AppDataSource.query(
      `SELECT * FROM scheduled_notification 
       WHERE status = 'pending' AND scheduled_at <= NOW()
       ORDER BY scheduled_at ASC LIMIT 100`
    );

    let sent = 0;
    let failed = 0;

    for (const notification of pending) {
      try {
        await this.sendNotification(notification);
        await AppDataSource.query(
          `UPDATE scheduled_notification SET status = 'sent', sent_at = NOW() WHERE id = $1`,
          [notification.id]
        );
        sent++;
      } catch (error) {
        await AppDataSource.query(
          `UPDATE scheduled_notification SET status = 'failed', error = $1 WHERE id = $2`,
          [(error as Error).message, notification.id]
        );
        failed++;
      }
    }

    if (pending.length > 0) {
      logger.info(`[Scheduler] Processed ${pending.length} notifications: sent=${sent}, failed=${failed}`);
    }

    return { processed: pending.length, sent, failed };
  }

  /**
   * Generate renewal reminders for policies expiring soon
   */
  async generateRenewalReminders(): Promise<{ generated: number }> {
    const config = this.defaultRenewalConfig;
    if (!config.enabled) return { generated: 0 };

    let generated = 0;

    for (const daysBefore of config.days_before_expiry) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysBefore);
      const dateStr = targetDate.toISOString().slice(0, 10);

      // Find policies expiring on target date that don't have a reminder scheduled
      const policies = await AppDataSource.query(`
        SELECT p.id as policy_id, p.policy_number, p.customer_id, p.end_date, p.premium_amount,
               pr.name as product_name, pr.insurance_type, c.full_name, c.email, c.phone
        FROM policy p
        JOIN product pr ON p.product_id = pr.id
        JOIN customer c ON p.customer_id = c.id
        WHERE p.status = 'active'
          AND DATE(p.end_date) = $1
          AND p.id NOT IN (
            SELECT policy_id FROM scheduled_notification 
            WHERE type = 'renewal_reminder' AND policy_id IS NOT NULL
            AND template_data->>'days_before' = $2
            AND status IN ('pending', 'sent')
          )
      `, [dateStr, String(daysBefore)]);

      for (const policy of policies) {
        for (const channel of config.channels) {
          await this.scheduleNotification({
            type: 'renewal_reminder',
            customer_id: policy.customer_id,
            policy_id: policy.policy_id,
            channel,
            scheduled_at: new Date().toISOString(), // Send immediately
            template_data: {
              days_before: daysBefore,
              policy_number: policy.policy_number,
              product_name: policy.product_name,
              expiry_date: policy.end_date,
              premium_amount: policy.premium_amount,
              customer_name: policy.full_name,
              email: policy.email,
              phone: policy.phone,
            },
          });
          generated++;
        }
      }
    }

    if (generated > 0) {
      logger.info(`[Scheduler] Generated ${generated} renewal reminders`);
    }

    return { generated };
  }

  /**
   * Generate payment due reminders
   */
  async generatePaymentReminders(): Promise<{ generated: number }> {
    // Find installment payments due in 3 days
    const dueSoon = await AppDataSource.query(`
      SELECT ip.id, ip.policy_id, ip.customer_id, ip.amount, ip.due_date,
             p.policy_number, pr.name as product_name, c.full_name, c.email
      FROM installment_payment ip
      JOIN policy p ON ip.policy_id = p.id
      JOIN product pr ON p.product_id = pr.id
      JOIN customer c ON ip.customer_id = c.id
      WHERE ip.status = 'pending'
        AND ip.due_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
        AND ip.id NOT IN (
          SELECT COALESCE(template_data->>'installment_id', '') FROM scheduled_notification 
          WHERE type = 'payment_due' AND status IN ('pending', 'sent')
        )
    `);

    let generated = 0;
    for (const payment of dueSoon) {
      await this.scheduleNotification({
        type: 'payment_due',
        customer_id: payment.customer_id,
        policy_id: payment.policy_id,
        channel: 'all',
        scheduled_at: new Date().toISOString(),
        template_data: {
          installment_id: payment.id,
          policy_number: payment.policy_number,
          product_name: payment.product_name,
          amount: payment.amount,
          due_date: payment.due_date,
          customer_name: payment.full_name,
          email: payment.email,
        },
      });
      generated++;
    }

    return { generated };
  }

  /**
   * Generate birthday greetings
   */
  async generateBirthdayNotifications(): Promise<{ generated: number }> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const month = tomorrow.getMonth() + 1;
    const day = tomorrow.getDate();

    const customers = await AppDataSource.query(`
      SELECT id, full_name, email, date_of_birth
      FROM customer
      WHERE EXTRACT(MONTH FROM date_of_birth) = $1 AND EXTRACT(DAY FROM date_of_birth) = $2
        AND id NOT IN (
          SELECT customer_id FROM scheduled_notification 
          WHERE type = 'birthday' AND EXTRACT(YEAR FROM scheduled_at) = EXTRACT(YEAR FROM NOW())
          AND status IN ('pending', 'sent')
        )
    `, [month, day]);

    let generated = 0;
    for (const customer of customers) {
      await this.scheduleNotification({
        type: 'birthday',
        customer_id: customer.id,
        channel: 'email',
        scheduled_at: tomorrow.toISOString(),
        template_data: {
          customer_name: customer.full_name,
          email: customer.email,
        },
      });
      generated++;
    }

    return { generated };
  }

  /**
   * Schedule a single notification
   */
  async scheduleNotification(input: Omit<ScheduledNotification, 'id' | 'status' | 'sent_at'>): Promise<string> {
    const id = uuidv4();
    await AppDataSource.query(
      `INSERT INTO scheduled_notification (id, type, customer_id, policy_id, channel, scheduled_at, status, template_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW())`,
      [id, input.type, input.customer_id, input.policy_id || null, input.channel, input.scheduled_at, JSON.stringify(input.template_data)]
    );
    return id;
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE scheduled_notification SET status = 'cancelled' WHERE id = $1 AND status = 'pending'`,
      [notificationId]
    );
  }

  /**
   * Get scheduled notifications status
   */
  async getSchedulerStatus(): Promise<{ pending: number; sent_today: number; failed_today: number; next_run: string }> {
    const stats = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM scheduled_notification WHERE status = 'pending') as pending,
        (SELECT COUNT(*) FROM scheduled_notification WHERE status = 'sent' AND DATE(sent_at) = CURRENT_DATE) as sent_today,
        (SELECT COUNT(*) FROM scheduled_notification WHERE status = 'failed' AND DATE(scheduled_at) = CURRENT_DATE) as failed_today
    `);

    return {
      pending: parseInt(stats[0]?.pending) || 0,
      sent_today: parseInt(stats[0]?.sent_today) || 0,
      failed_today: parseInt(stats[0]?.failed_today) || 0,
      next_run: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Every hour
    };
  }

  /**
   * Run all scheduled jobs (main entry point for cron)
   */
  async runAllJobs(): Promise<{ renewal: number; payment: number; birthday: number; processed: { sent: number; failed: number } }> {
    const [renewal, payment, birthday] = await Promise.all([
      this.generateRenewalReminders(),
      this.generatePaymentReminders(),
      this.generateBirthdayNotifications(),
    ]);

    const processed = await this.processScheduledNotifications();

    return {
      renewal: renewal.generated,
      payment: payment.generated,
      birthday: birthday.generated,
      processed: { sent: processed.sent, failed: processed.failed },
    };
  }

  // ============ Private Methods ============

  private async sendNotification(notification: any): Promise<void> {
    const data = notification.template_data;

    switch (notification.channel) {
      case 'email':
        await this.sendEmailNotification(notification.type, data);
        break;
      case 'sms':
        await this.sendSMSNotification(notification.type, data);
        break;
      case 'push':
        await this.sendPushNotification(notification.type, notification.customer_id, data);
        break;
      case 'all':
        await Promise.allSettled([
          this.sendEmailNotification(notification.type, data),
          this.sendPushNotification(notification.type, notification.customer_id, data),
        ]);
        break;
    }
  }

  private async sendEmailNotification(type: string, data: any): Promise<void> {
    const templates: Record<string, { subject: string; body: string }> = {
      renewal_reminder: {
        subject: `[Nhắc nhở] Hợp đồng ${data.product_name} sắp hết hạn (còn ${data.days_before} ngày)`,
        body: `Kính gửi ${data.customer_name}, hợp đồng ${data.policy_number} sẽ hết hạn ngày ${new Date(data.expiry_date).toLocaleDateString('vi-VN')}. Gia hạn ngay để tiếp tục được bảo vệ.`,
      },
      payment_due: {
        subject: `[Nhắc nhở] Phí bảo hiểm đến hạn thanh toán`,
        body: `Kính gửi ${data.customer_name}, khoản phí ${(data.amount / 1000000).toFixed(1)} triệu VND cho HĐ ${data.policy_number} đến hạn ngày ${new Date(data.due_date).toLocaleDateString('vi-VN')}.`,
      },
      birthday: {
        subject: `Chúc mừng sinh nhật ${data.customer_name}! 🎂`,
        body: `Chúc ${data.customer_name} một ngày sinh nhật thật vui vẻ! Dành tặng bạn ưu đãi đặc biệt 10% cho lần mua tiếp theo.`,
      },
    };

    const template = templates[type];
    if (!template) return;

    // In production: use email service (SendGrid/SES)
    logger.debug(`[Email] To: ${data.email}, Subject: ${template.subject}`);
  }

  private async sendSMSNotification(type: string, data: any): Promise<void> {
    const messages: Record<string, string> = {
      renewal_reminder: `[Insurance] HD ${data.policy_number} het han ngay ${new Date(data.expiry_date).toLocaleDateString('vi-VN')}. Gia han tai app.`,
      payment_due: `[Insurance] Phi BH ${(data.amount / 1000000).toFixed(1)}tr den han ${new Date(data.due_date).toLocaleDateString('vi-VN')}. Thanh toan tai app.`,
    };

    const message = messages[type];
    if (!message || !data.phone) return;

    logger.debug(`[SMS] To: ${data.phone}, Message: ${message}`);
  }

  private async sendPushNotification(type: string, customerId: string, data: any): Promise<void> {
    // Would integrate with PushNotificationService
    logger.debug(`[Push] To: ${customerId}, Type: ${type}`);
  }
}
