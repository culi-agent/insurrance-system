/**
 * Admin Notification Templates Management
 * Sprint 8: S8-07
 */

export interface NotificationTemplate {
  id: string;
  event: string;
  channel: 'email' | 'sms' | 'push';
  subject?: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// In-memory storage (production: use DB)
const templates: NotificationTemplate[] = [
  {
    id: '1', event: 'payment_success', channel: 'email',
    subject: 'Thanh toán thành công - {{order_number}}',
    body: 'Chào {{customer_name}}, thanh toán {{amount}} VND cho đơn {{order_number}} thành công.',
    variables: ['customer_name', 'amount', 'order_number'], is_active: true,
    created_at: '2026-01-01', updated_at: '2026-01-01',
  },
  {
    id: '2', event: 'policy_issued', channel: 'email',
    subject: 'Hợp đồng bảo hiểm {{policy_number}} đã phát hành',
    body: 'Chào {{customer_name}}, hợp đồng {{policy_number}} đã được phát hành. Hiệu lực từ {{effective_date}}.',
    variables: ['customer_name', 'policy_number', 'effective_date'], is_active: true,
    created_at: '2026-01-01', updated_at: '2026-01-01',
  },
  {
    id: '3', event: 'payment_success', channel: 'sms',
    subject: undefined,
    body: 'Thanh toan {{amount}} VND cho don {{order_number}} thanh cong. Chi tiet tai app.',
    variables: ['amount', 'order_number'], is_active: true,
    created_at: '2026-01-01', updated_at: '2026-01-01',
  },
];

export class AdminNotificationService {
  static getTemplates(channel?: string): NotificationTemplate[] {
    if (channel) return templates.filter(t => t.channel === channel);
    return templates;
  }

  static getTemplateById(id: string): NotificationTemplate | undefined {
    return templates.find(t => t.id === id);
  }

  static updateTemplate(id: string, data: Partial<NotificationTemplate>): NotificationTemplate | null {
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1) return null;
    templates[idx] = { ...templates[idx], ...data, updated_at: new Date().toISOString() };
    return templates[idx];
  }

  static createTemplate(data: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>): NotificationTemplate {
    const template: NotificationTemplate = {
      ...data,
      id: String(templates.length + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    templates.push(template);
    return template;
  }

  static toggleTemplate(id: string): NotificationTemplate | null {
    const template = templates.find(t => t.id === id);
    if (!template) return null;
    template.is_active = !template.is_active;
    template.updated_at = new Date().toISOString();
    return template;
  }
}
