import { Router } from 'express';
import { MobilePurchaseController } from '../controllers/mobile-purchase.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

// All mobile purchase routes require authentication
router.use(authenticate);

// Quick purchase (streamlined flow for mobile)
router.post('/purchase', MobilePurchaseController.quickPurchase);

// Payment status check (polling)
router.get('/purchase/:orderId/status', MobilePurchaseController.checkPaymentStatus);

// Retry payment
router.post('/purchase/:orderId/retry', MobilePurchaseController.retryPayment);

// Order history
router.get('/orders', MobilePurchaseController.getOrderHistory);

export default router;
