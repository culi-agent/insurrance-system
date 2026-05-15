/**
 * Customer Support Chat Integration Service
 * Sprint 9: S9-06 - Chat support integration (Intercom/Tawk.to style)
 */
import { logger } from '../../../shared/utils/logger';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'agent' | 'bot';
  sender_id: string;
  sender_name: string;
  message: string;
  attachments?: Array<{ url: string; type: string; name: string }>;
  timestamp: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  subject: string;
  status: 'open' | 'assigned' | 'resolved' | 'closed';
  assigned_to?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// In-memory store (production: use DB + WebSocket)
const conversations = new Map<string, Conversation>();

export class ChatSupportService {
  /**
   * Create new conversation
   */
  static createConversation(customerId: string, customerName: string, subject: string): Conversation {
    const id = `CONV-${Date.now().toString(36).toUpperCase()}`;
    const conversation: Conversation = {
      id,
      customer_id: customerId,
      customer_name: customerName,
      subject,
      status: 'open',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Auto-reply bot message
    conversation.messages.push({
      id: `MSG-${Date.now()}`,
      conversation_id: id,
      sender_type: 'bot',
      sender_id: 'system',
      sender_name: 'Trợ lý ảo',
      message: `Xin chào ${customerName}! Cảm ơn bạn đã liên hệ. Nhân viên tư vấn sẽ phản hồi trong ít phút. Bạn cần hỗ trợ về vấn đề gì?`,
      timestamp: new Date().toISOString(),
    });

    conversations.set(id, conversation);
    logger.info(`[Chat] New conversation ${id} from ${customerName}`);
    return conversation;
  }

  /**
   * Send message in conversation
   */
  static sendMessage(conversationId: string, senderId: string, senderName: string, senderType: ChatMessage['sender_type'], message: string): ChatMessage | null {
    const conversation = conversations.get(conversationId);
    if (!conversation) return null;

    const chatMessage: ChatMessage = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversation_id: conversationId,
      sender_type: senderType,
      sender_id: senderId,
      sender_name: senderName,
      message,
      timestamp: new Date().toISOString(),
    };

    conversation.messages.push(chatMessage);
    conversation.updated_at = new Date().toISOString();

    return chatMessage;
  }

  /**
   * Get conversation by ID
   */
  static getConversation(conversationId: string): Conversation | undefined {
    return conversations.get(conversationId);
  }

  /**
   * Get customer's conversations
   */
  static getCustomerConversations(customerId: string): Conversation[] {
    return Array.from(conversations.values())
      .filter(c => c.customer_id === customerId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  /**
   * Get open conversations (for admin)
   */
  static getOpenConversations(): Conversation[] {
    return Array.from(conversations.values())
      .filter(c => c.status === 'open' || c.status === 'assigned')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  /**
   * Assign conversation to agent
   */
  static assignConversation(conversationId: string, agentId: string): boolean {
    const conversation = conversations.get(conversationId);
    if (!conversation) return false;
    conversation.assigned_to = agentId;
    conversation.status = 'assigned';
    conversation.updated_at = new Date().toISOString();
    return true;
  }

  /**
   * Resolve conversation
   */
  static resolveConversation(conversationId: string): boolean {
    const conversation = conversations.get(conversationId);
    if (!conversation) return false;
    conversation.status = 'resolved';
    conversation.updated_at = new Date().toISOString();
    return true;
  }
}
