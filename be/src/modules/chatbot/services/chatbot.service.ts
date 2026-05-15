import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'bot' | 'agent';
  content: string;
  intent?: string;
  metadata?: any;
  created_at: string;
}

export interface ChatSession {
  id: string;
  customer_id?: string;
  status: 'active' | 'resolved' | 'escalated';
  topic?: string;
  satisfaction_rating?: number;
  created_at: string;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export class ChatbotService {
  private faqs: FAQ[] = [
    { question: 'Làm sao để mua bảo hiểm?', answer: 'Bạn có thể mua bảo hiểm trực tiếp trên website bằng cách: 1) Chọn loại bảo hiểm phù hợp, 2) Nhập thông tin để nhận báo giá, 3) So sánh các gói, 4) Hoàn tất thanh toán online. Quá trình chỉ mất 5-10 phút!', category: 'purchase', keywords: ['mua', 'đặt', 'order', 'purchase'] },
    { question: 'Tôi muốn yêu cầu bồi thường', answer: 'Để yêu cầu bồi thường: 1) Đăng nhập vào tài khoản, 2) Vào mục "Yêu cầu bồi thường", 3) Chọn hợp đồng liên quan, 4) Điền thông tin sự kiện và tải ảnh chứng từ. Chúng tôi sẽ xử lý trong 3-15 ngày làm việc.', category: 'claims', keywords: ['bồi thường', 'claim', 'yêu cầu', 'bồi'] },
    { question: 'Làm sao để gia hạn hợp đồng?', answer: 'Hợp đồng sắp hết hạn sẽ được nhắc nhở qua email/SMS. Bạn có thể gia hạn online tại mục "Gia hạn" trong Dashboard, hoặc bật tính năng gia hạn tự động.', category: 'renewal', keywords: ['gia hạn', 'renewal', 'hết hạn', 'extend'] },
    { question: 'Phí bảo hiểm được tính như thế nào?', answer: 'Phí bảo hiểm phụ thuộc vào: loại bảo hiểm, mức bảo vệ, tuổi, tình trạng sức khỏe (BH sức khỏe), giá trị tài sản (BH tài sản). Bạn có thể nhập thông tin để nhận báo giá chính xác ngay trên website.', category: 'pricing', keywords: ['phí', 'giá', 'premium', 'chi phí', 'tính'] },
    { question: 'Tôi muốn hủy hợp đồng', answer: 'Bạn có thể hủy hợp đồng tại Dashboard > Hợp đồng > Hủy. Tùy thời điểm hủy, bạn có thể được hoàn phí theo tỷ lệ pro-rata. Lưu ý: Hủy trước 15 ngày kể từ ngày mua được hoàn 100%.', category: 'cancellation', keywords: ['hủy', 'cancel', 'chấm dứt', 'ngừng'] },
    { question: 'Thời gian xử lý bồi thường bao lâu?', answer: 'Thời gian xử lý trung bình: Claims < 5 triệu: 3 ngày | Claims < 20 triệu: 7 ngày | Claims lớn: 10-15 ngày. Bạn có thể theo dõi tiến độ realtime tại mục Claims trong Dashboard.', category: 'claims', keywords: ['thời gian', 'bao lâu', 'xử lý', 'chờ'] },
    { question: 'Các phương thức thanh toán nào được hỗ trợ?', answer: 'Chúng tôi hỗ trợ: VNPay, MoMo, ZaloPay, chuyển khoản ngân hàng, thẻ Visa/Mastercard. Thanh toán trả góp cũng khả dụng cho các gói > 5 triệu đồng.', category: 'payment', keywords: ['thanh toán', 'trả tiền', 'payment', 'chuyển khoản'] },
    { question: 'Giới thiệu bạn bè nhận thưởng?', answer: 'Chương trình giới thiệu: Chia sẻ link giới thiệu → Bạn bè mua BH → Bạn nhận 100.000đ + bạn bè giảm 50.000đ. Không giới hạn số lượng giới thiệu! Xem tại Dashboard > Giới thiệu.', category: 'referral', keywords: ['giới thiệu', 'referral', 'bạn bè', 'thưởng'] },
    { question: 'Tôi cần hỗ trợ từ nhân viên', answer: 'Tôi sẽ chuyển bạn đến nhân viên hỗ trợ. Vui lòng chờ trong giây lát...', category: 'escalation', keywords: ['nhân viên', 'agent', 'hỗ trợ', 'tư vấn', 'gọi'] },
    { question: 'Tôi quên mật khẩu', answer: 'Bạn có thể đặt lại mật khẩu tại trang đăng nhập > "Quên mật khẩu". Nhập email/SĐT đã đăng ký, chúng tôi sẽ gửi mã OTP để xác minh.', category: 'auth', keywords: ['mật khẩu', 'password', 'quên', 'đăng nhập'] },
  ];

  /**
   * Process user message and return bot response
   */
  async processMessage(sessionId: string, customerId: string | null, message: string): Promise<ChatMessage> {
    // Save user message
    await this.saveMessage(sessionId, 'user', message, customerId);

    // Find best matching FAQ
    const response = this.findBestResponse(message);
    const intent = this.detectIntent(message);

    // Check if escalation needed
    if (intent === 'escalation' || response.confidence < 0.3) {
      await this.escalateSession(sessionId);
      const botMsg = await this.saveMessage(sessionId, 'bot', 'Tôi sẽ chuyển bạn đến nhân viên tư vấn. Vui lòng chờ trong giây lát, nhân viên sẽ liên hệ sớm nhất!', customerId, 'escalation');
      return botMsg;
    }

    // Generate response
    const botMsg = await this.saveMessage(sessionId, 'bot', response.answer, customerId, intent);
    return botMsg;
  }

  /**
   * Start new chat session
   */
  async startSession(customerId?: string): Promise<ChatSession> {
    const id = uuidv4();
    await AppDataSource.query(
      `INSERT INTO chat_session (id, customer_id, status, created_at) VALUES ($1, $2, 'active', NOW())`,
      [id, customerId || null]
    );
    return { id, customer_id: customerId, status: 'active', created_at: new Date().toISOString() };
  }

  /**
   * Get session messages
   */
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    return AppDataSource.query(
      `SELECT * FROM chat_message WHERE session_id = $1 ORDER BY created_at ASC`,
      [sessionId]
    );
  }

  /**
   * Rate session
   */
  async rateSession(sessionId: string, rating: number, feedback?: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE chat_session SET satisfaction_rating = $1, feedback = $2, status = 'resolved', resolved_at = NOW() WHERE id = $3`,
      [rating, feedback || null, sessionId]
    );
  }

  /**
   * Get suggested questions
   */
  getSuggestedQuestions(): string[] {
    return [
      'Làm sao để mua bảo hiểm?',
      'Tôi muốn yêu cầu bồi thường',
      'Phí bảo hiểm được tính như thế nào?',
      'Các phương thức thanh toán nào được hỗ trợ?',
      'Giới thiệu bạn bè nhận thưởng?',
    ];
  }

  // ============ Private Methods ============

  private findBestResponse(message: string): { answer: string; confidence: number } {
    const normalizedMsg = message.toLowerCase().trim();
    let bestMatch: FAQ | null = null;
    let bestScore = 0;

    for (const faq of this.faqs) {
      let score = 0;
      for (const keyword of faq.keywords) {
        if (normalizedMsg.includes(keyword)) score += 1;
      }
      // Normalize score
      const normalizedScore = score / faq.keywords.length;
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestMatch = faq;
      }
    }

    if (bestMatch && bestScore >= 0.3) {
      return { answer: bestMatch.answer, confidence: bestScore };
    }

    return { answer: 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể mô tả chi tiết hơn hoặc chọn một trong các chủ đề gợi ý bên dưới?', confidence: 0 };
  }

  private detectIntent(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes('mua') || msg.includes('đặt')) return 'purchase';
    if (msg.includes('bồi thường') || msg.includes('claim')) return 'claims';
    if (msg.includes('gia hạn') || msg.includes('renewal')) return 'renewal';
    if (msg.includes('hủy') || msg.includes('cancel')) return 'cancellation';
    if (msg.includes('nhân viên') || msg.includes('agent') || msg.includes('tư vấn')) return 'escalation';
    if (msg.includes('phí') || msg.includes('giá')) return 'pricing';
    if (msg.includes('thanh toán') || msg.includes('trả')) return 'payment';
    return 'general';
  }

  private async saveMessage(sessionId: string, role: ChatMessage['role'], content: string, customerId?: string | null, intent?: string): Promise<ChatMessage> {
    const id = uuidv4();
    await AppDataSource.query(
      `INSERT INTO chat_message (id, session_id, customer_id, role, content, intent, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, sessionId, customerId || null, role, content, intent || null]
    );
    return { id, session_id: sessionId, role, content, intent, created_at: new Date().toISOString() };
  }

  private async escalateSession(sessionId: string): Promise<void> {
    await AppDataSource.query(
      `UPDATE chat_session SET status = 'escalated' WHERE id = $1`, [sessionId]
    );
  }
}
