import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface DeviceRegistration {
  device_token: string;
  platform: 'ios' | 'android';
  device_id: string;
  app_version: string;
  os_version: string;
  device_model?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  image_url?: string;
  action_url?: string;
  badge_count?: number;
  sound?: string;
  channel_id?: string; // Android notification channel
  category?: string; // iOS notification category
}

export interface NotificationPreferences {
  policy_updates: boolean;
  claim_updates: boolean;
  payment_reminders: boolean;
  renewal_reminders: boolean;
  promotions: boolean;
  recommendations: boolean;
  security_alerts: boolean;
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  data?: Record<string, any>;
  sent_at: string;
}

export type NotificationType =
  | 'policy_issued'
  | 'policy_expiring'
  | 'claim_submitted'
  | 'claim_updated'
  | 'claim_approved'
  | 'claim_rejected'
  | 'payment_success'
  | 'payment_failed'
  | 'payment_reminder'
  | 'renewal_reminder'
  | 'promotion'
  | 'recommendation'
  | 'security_alert'
  | 'system';

export class PushNotificationService {
  /**
   * Register device for push notifications
   */
  async registerDevice(customerId: string, device: DeviceRegistration): Promise<{ success: boolean; device_id: string }> {
    const id = uuidv4();

    // Upsert device registration (one device_token per customer per platform)
    await AppDataSource.query(
      `INSERT INTO device_registration (id, customer_id, device_token, platform, device_id, app_version, os_version, device_model, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
       ON CONFLICT (customer_id, device_id) DO UPDATE SET
         device_token = $3, platform = $4, app_version = $6, os_version = $7, 
         device_model = $8, is_active = true, updated_at = NOW()`,
      [id, customerId, device.device_token, device.platform, device.device_id, device.app_version, device.os_version, device.device_model || null]
    );

    logger.info(`[Push] Device registered: customer=${customerId}, platform=${device.platform}, device=${device.device_id}`);

    return { success: true, device_id: device.device_id };
  }

  /**
   * Unregister device (logout or disable notifications)
   */
  async unregisterDevice(customerId: string, deviceId: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE device_registration SET is_active = false, updated_at = NOW() WHERE customer_id = $1 AND device_id = $2`,
      [customerId, deviceId]
    );

    logger.info(`[Push] Device unregistered: customer=${customerId}, device=${deviceId}`);
  }

  /**
   * Send push notification to a specific customer
   */
  async sendToCustomer(customerId: string, type: NotificationType, payload: PushNotificationPayload): Promise<{ sent: number; failed: number }> {
    // Check notification preferences
    const prefAllowed = await this.checkPreferences(customerId, type);
    if (!prefAllowed) {
      logger.debug(`[Push] Notification blocked by preferences: customer=${customerId}, type=${type}`);
      return { sent: 0, failed: 0 };
    }

    // Get active devices for customer
    const devices = await AppDataSource.query(
      `SELECT device_token, platform FROM device_registration WHERE customer_id = $1 AND is_active = true`,
      [customerId]
    );

    if (devices.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const device of devices) {
      try {
        await this.sendToDevice(device.device_token, device.platform, payload);
        sent++;
      } catch (error) {
        failed++;
        logger.warn(`[Push] Failed to send to device: ${device.device_token}`, error);
        // Mark device as inactive if token is invalid
        if (this.isInvalidTokenError(error)) {
          await AppDataSource.query(
            `UPDATE device_registration SET is_active = false WHERE device_token = $1`,
            [device.device_token]
          );
        }
      }
    }

    // Save notification to history
    await this.saveNotificationHistory(customerId, type, payload);

    logger.info(`[Push] Sent to customer=${customerId}: type=${type}, sent=${sent}, failed=${failed}`);
    return { sent, failed };
  }

  /**
   * Send push notification to multiple customers (batch)
   */
  async sendBatch(customerIds: string[], type: NotificationType, payload: PushNotificationPayload): Promise<{ total_sent: number; total_failed: number }> {
    let totalSent = 0;
    let totalFailed = 0;

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < customerIds.length; i += batchSize) {
      const batch = customerIds.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(customerId => this.sendToCustomer(customerId, type, payload))
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          totalSent += result.value.sent;
          totalFailed += result.value.failed;
        } else {
          totalFailed++;
        }
      }
    }

    logger.info(`[Push] Batch sent: type=${type}, total_sent=${totalSent}, total_failed=${totalFailed}`);
    return { total_sent: totalSent, total_failed: totalFailed };
  }

  /**
   * Send to all customers matching a segment
   */
  async sendToSegment(segmentQuery: string, type: NotificationType, payload: PushNotificationPayload): Promise<{ total_sent: number; total_failed: number }> {
    const customers = await AppDataSource.query(
      `SELECT DISTINCT customer_id FROM device_registration WHERE is_active = true 
       AND customer_id IN (${segmentQuery})`
    );

    const customerIds = customers.map((c: any) => c.customer_id);
    return this.sendBatch(customerIds, type, payload);
  }

  /**
   * Get notification preferences for customer
   */
  async getPreferences(customerId: string): Promise<NotificationPreferences> {
    const result = await AppDataSource.query(
      `SELECT preferences FROM notification_preferences WHERE customer_id = $1`,
      [customerId]
    );

    if (result.length === 0) {
      return this.getDefaultPreferences();
    }

    return result[0].preferences;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(customerId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = await this.getPreferences(customerId);
    const updated = { ...current, ...preferences };

    await AppDataSource.query(
      `INSERT INTO notification_preferences (id, customer_id, preferences, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (customer_id) DO UPDATE SET preferences = $3, updated_at = NOW()`,
      [uuidv4(), customerId, JSON.stringify(updated)]
    );

    return updated;
  }

  /**
   * Get notification history for customer
   */
  async getNotificationHistory(customerId: string, page: number = 1, limit: number = 20): Promise<{ notifications: NotificationHistoryItem[]; total: number; unread_count: number }> {
    const offset = (page - 1) * limit;

    const [notifications, countResult, unreadResult] = await Promise.all([
      AppDataSource.query(
        `SELECT id, title, body, type, is_read, data, created_at as sent_at
         FROM notification_history
         WHERE customer_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [customerId, limit, offset]
      ),
      AppDataSource.query(
        `SELECT COUNT(*) as total FROM notification_history WHERE customer_id = $1`,
        [customerId]
      ),
      AppDataSource.query(
        `SELECT COUNT(*) as unread FROM notification_history WHERE customer_id = $1 AND is_read = false`,
        [customerId]
      ),
    ]);

    return {
      notifications: notifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        is_read: n.is_read,
        data: n.data,
        sent_at: n.sent_at,
      })),
      total: parseInt(countResult[0]?.total) || 0,
      unread_count: parseInt(unreadResult[0]?.unread) || 0,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(customerId: string, notificationId: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE notification_history SET is_read = true WHERE id = $1 AND customer_id = $2`,
      [notificationId, customerId]
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(customerId: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE notification_history SET is_read = true WHERE customer_id = $1 AND is_read = false`,
      [customerId]
    );
  }

  /**
   * Get unread count
   */
  async getUnreadCount(customerId: string): Promise<number> {
    const result = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM notification_history WHERE customer_id = $1 AND is_read = false`,
      [customerId]
    );
    return parseInt(result[0]?.count) || 0;
  }

  // ============ Notification Templates ============

  /**
   * Send policy issued notification
   */
  async notifyPolicyIssued(customerId: string, policyNumber: string, productName: string): Promise<void> {
    await this.sendToCustomer(customerId, 'policy_issued', {
      title: 'Hợp đồng mới đã phát hành! 🎉',
      body: `Hợp đồng ${productName} (${policyNumber}) đã được phát hành thành công.`,
      data: { policy_number: policyNumber, action: 'view_policy' },
      sound: 'success',
    });
  }

  /**
   * Send claim status update notification
   */
  async notifyClaimUpdate(customerId: string, claimNumber: string, status: string, message?: string): Promise<void> {
    const statusMessages: Record<string, string> = {
      under_review: 'Yêu cầu đang được xem xét',
      processing: 'Yêu cầu đang được xử lý',
      approved: 'Yêu cầu đã được duyệt! 🎉',
      rejected: 'Yêu cầu không được chấp nhận',
      settled: 'Đã hoàn tất thanh toán bồi thường! 💰',
    };

    const type: NotificationType = status === 'approved' ? 'claim_approved' : status === 'rejected' ? 'claim_rejected' : 'claim_updated';

    await this.sendToCustomer(customerId, type, {
      title: `Cập nhật yêu cầu bồi thường #${claimNumber}`,
      body: message || statusMessages[status] || `Trạng thái: ${status}`,
      data: { claim_number: claimNumber, status, action: 'view_claim' },
      sound: status === 'approved' || status === 'settled' ? 'success' : 'default',
    });
  }

  /**
   * Send payment reminder
   */
  async notifyPaymentReminder(customerId: string, policyNumber: string, amount: number, dueDate: string): Promise<void> {
    await this.sendToCustomer(customerId, 'payment_reminder', {
      title: 'Nhắc nhở thanh toán phí bảo hiểm',
      body: `Phí bảo hiểm ${(amount / 1000000).toFixed(1)} triệu VND cho HĐ ${policyNumber} đến hạn ngày ${new Date(dueDate).toLocaleDateString('vi-VN')}.`,
      data: { policy_number: policyNumber, amount, due_date: dueDate, action: 'make_payment' },
    });
  }

  /**
   * Send renewal reminder
   */
  async notifyRenewalReminder(customerId: string, policyNumber: string, productName: string, expiryDate: string, daysLeft: number): Promise<void> {
    await this.sendToCustomer(customerId, 'renewal_reminder', {
      title: `Hợp đồng sắp hết hạn (còn ${daysLeft} ngày)`,
      body: `${productName} (${policyNumber}) sẽ hết hạn ngày ${new Date(expiryDate).toLocaleDateString('vi-VN')}. Gia hạn ngay để không bị gián đoạn bảo vệ.`,
      data: { policy_number: policyNumber, expiry_date: expiryDate, days_left: daysLeft, action: 'renew_policy' },
    });
  }

  // ============ Private Methods ============

  private async sendToDevice(deviceToken: string, platform: string, payload: PushNotificationPayload): Promise<void> {
    // In production, this would use Firebase Cloud Messaging (FCM) or APNs
    // For now, we simulate the send
    if (platform === 'ios') {
      await this.sendAPNs(deviceToken, payload);
    } else {
      await this.sendFCM(deviceToken, payload);
    }
  }

  private async sendFCM(deviceToken: string, payload: PushNotificationPayload): Promise<void> {
    // Firebase Cloud Messaging integration
    // In production: use firebase-admin SDK
    const fcmPayload = {
      to: deviceToken,
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.image_url,
        sound: payload.sound || 'default',
        channel_id: payload.channel_id || 'insurance_default',
      },
      data: payload.data || {},
    };

    // Simulate FCM call
    logger.debug(`[FCM] Sending to ${deviceToken.slice(0, 10)}...`, { title: payload.title });

    // In production:
    // const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(fcmPayload),
    // });
  }

  private async sendAPNs(deviceToken: string, payload: PushNotificationPayload): Promise<void> {
    // Apple Push Notification service integration
    // In production: use @parse/node-apn or similar
    const apnsPayload = {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body,
        },
        badge: payload.badge_count,
        sound: payload.sound || 'default',
        category: payload.category,
      },
      ...payload.data,
    };

    logger.debug(`[APNs] Sending to ${deviceToken.slice(0, 10)}...`, { title: payload.title });

    // In production: send via APNs HTTP/2 connection
  }

  private async saveNotificationHistory(customerId: string, type: NotificationType, payload: PushNotificationPayload): Promise<void> {
    await AppDataSource.query(
      `INSERT INTO notification_history (id, customer_id, title, body, type, is_read, data, created_at)
       VALUES ($1, $2, $3, $4, $5, false, $6, NOW())`,
      [uuidv4(), customerId, payload.title, payload.body, type, JSON.stringify(payload.data || {})]
    );
  }

  private async checkPreferences(customerId: string, type: NotificationType): Promise<boolean> {
    const prefs = await this.getPreferences(customerId);

    const typeToPreference: Record<string, keyof NotificationPreferences> = {
      policy_issued: 'policy_updates',
      policy_expiring: 'policy_updates',
      claim_submitted: 'claim_updates',
      claim_updated: 'claim_updates',
      claim_approved: 'claim_updates',
      claim_rejected: 'claim_updates',
      payment_success: 'payment_reminders',
      payment_failed: 'payment_reminders',
      payment_reminder: 'payment_reminders',
      renewal_reminder: 'renewal_reminders',
      promotion: 'promotions',
      recommendation: 'recommendations',
      security_alert: 'security_alerts',
      system: 'security_alerts', // Always allowed
    };

    const prefKey = typeToPreference[type];
    if (!prefKey) return true; // Allow if no mapping
    return prefs[prefKey] !== false; // Default to true
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      policy_updates: true,
      claim_updates: true,
      payment_reminders: true,
      renewal_reminders: true,
      promotions: true,
      recommendations: true,
      security_alerts: true,
    };
  }

  private isInvalidTokenError(error: any): boolean {
    // Check if error indicates invalid/expired token
    const message = error?.message || '';
    return message.includes('InvalidRegistration') ||
      message.includes('NotRegistered') ||
      message.includes('InvalidToken');
  }
}
