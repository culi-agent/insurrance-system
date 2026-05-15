import { Router } from 'express';
import { RenewalController } from '../controllers/renewal.controller';
import { authMiddleware } from '../../../shared/middleware/auth';

const router = Router();

// Customer routes (require auth)
router.use(authMiddleware);

// Get policies eligible for renewal
router.get('/eligible', RenewalController.getEligibleForRenewal);

// Renew a policy
router.post('/:policyId/renew', RenewalController.renewPolicy);

// Set auto-renewal preference
router.put('/:policyId/auto-renewal', RenewalController.setAutoRenewal);

// Cancel policy
router.post('/:policyId/cancel', RenewalController.cancelPolicy);

export default router;

// Admin routes for cron/scheduled tasks
export const renewalAdminRouter = Router();
renewalAdminRouter.use(authMiddleware);
renewalAdminRouter.post('/reminders/send', RenewalController.triggerRenewalReminders);
renewalAdminRouter.post('/auto-renew/process', RenewalController.processAutoRenewals);
