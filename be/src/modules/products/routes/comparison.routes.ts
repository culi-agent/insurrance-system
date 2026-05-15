import { Router, Request, Response, NextFunction } from 'express';
import { ComparisonService } from '../services/comparison.service';
import { ChatSupportService } from '../services/chat-support.service';
import { ApiResponse } from '../../../shared/utils/response';
import { authenticate } from '../../../shared/middleware/authenticate';
import { AuthenticatedRequest } from '../../../shared/types';

const router = Router();
const comparisonService = new ComparisonService();

// Compare products (public)
router.post('/compare', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product_ids } = req.body;
    if (!product_ids || !Array.isArray(product_ids) || product_ids.length < 2) {
      return ApiResponse.error(res, 'VALIDATION_ERROR', 'Cần ít nhất 2 sản phẩm để so sánh', 400);
    }
    const result = await comparisonService.compareProducts(product_ids);
    ApiResponse.success(res, result);
  } catch (error) { next(error); }
});

// Get recommendations (public, optionally auth)
router.post('/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await comparisonService.getRecommendations(req.body);
    ApiResponse.success(res, result);
  } catch (error) { next(error); }
});

// Chat support routes
router.post('/chat/conversations', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { subject } = req.body;
    const conversation = ChatSupportService.createConversation(
      req.user!.id, req.user!.email, subject || 'Hỗ trợ chung'
    );
    ApiResponse.created(res, conversation);
  } catch (error) { next(error); }
});

router.get('/chat/conversations', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const conversations = ChatSupportService.getCustomerConversations(req.user!.id);
    ApiResponse.success(res, conversations);
  } catch (error) { next(error); }
});

router.post('/chat/conversations/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    const result = ChatSupportService.sendMessage(req.params.id, req.user!.id, req.user!.email, 'customer', message);
    if (!result) return ApiResponse.error(res, 'NOT_FOUND', 'Cuộc hội thoại không tồn tại', 404);
    ApiResponse.success(res, result);
  } catch (error) { next(error); }
});

export default router;
