import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbot.service';

const service = new ChatbotService();

export class ChatbotController {
  async startSession(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id;
      const session = await service.startSession(customerId);
      res.status(201).json({ success: true, data: { session, suggested_questions: service.getSuggestedQuestions() } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'SESSION_ERROR', message: error.message } });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { session_id, message } = req.body;
      const customerId = (req as any).user?.id || null;
      const response = await service.processMessage(session_id, customerId, message);
      res.json({ success: true, data: response });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'MESSAGE_ERROR', message: error.message } });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const messages = await service.getSessionMessages(req.params.sessionId);
      res.json({ success: true, data: messages });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
    }
  }

  async rateSession(req: Request, res: Response) {
    try {
      const { rating, feedback } = req.body;
      await service.rateSession(req.params.sessionId, rating, feedback);
      res.json({ success: true, message: 'Cảm ơn bạn đã đánh giá!' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'RATE_ERROR', message: error.message } });
    }
  }

  async getSuggestions(req: Request, res: Response) {
    res.json({ success: true, data: service.getSuggestedQuestions() });
  }
}
