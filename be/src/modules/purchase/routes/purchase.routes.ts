import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validate } from '../../../shared/middleware/validate';
import {
  createOrderSchema,
  updateWizardStepSchema,
  ekycSchema,
  initiatePaymentSchema,
  cancelOrderSchema,
} from '../validators/purchase.validator';

const router = Router();

// All purchase routes require authentication
router.use(authenticate);

// Order management
router.post('/orders', validate(createOrderSchema), PurchaseController.createOrder);
router.get('/orders', PurchaseController.getMyOrders);
router.get('/orders/:orderId', PurchaseController.getOrder);
router.put('/orders/:orderId/wizard', validate(updateWizardStepSchema), PurchaseController.updateWizardStep);
router.post('/orders/:orderId/cancel', validate(cancelOrderSchema), PurchaseController.cancelOrder);

// eKYC
router.post('/orders/:orderId/ekyc', validate(ekycSchema), PurchaseController.performEkyc);

// Underwriting
router.post('/orders/:orderId/underwriting', PurchaseController.runUnderwriting);

// Payment
router.post('/orders/:orderId/payment', validate(initiatePaymentSchema), PurchaseController.initiatePayment);

// Policy management
router.get('/policies', PurchaseController.getMyPolicies);
router.get('/policies/:policyId', PurchaseController.getPolicyDetail);

export default router;

// Payment callbacks (no auth needed - called by payment gateways)
export const paymentCallbackRouter = Router();
paymentCallbackRouter.get('/payment/callback/vnpay', PurchaseController.paymentCallbackVNPay);
paymentCallbackRouter.post('/payment/callback/momo', PurchaseController.paymentCallbackMomo);
