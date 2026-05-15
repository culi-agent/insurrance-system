import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';

const router = Router();
const controller = new ChatbotController();

// Public (can be used without auth)
router.post('/session', controller.startSession.bind(controller));
router.post('/message', controller.sendMessage.bind(controller));
router.get('/session/:sessionId/messages', controller.getMessages.bind(controller));
router.post('/session/:sessionId/rate', controller.rateSession.bind(controller));
router.get('/suggestions', controller.getSuggestions.bind(controller));

export default router;
