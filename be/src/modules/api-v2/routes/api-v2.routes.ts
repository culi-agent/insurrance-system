import { Router } from 'express';
import { ApiV2Controller } from '../controllers/api-v2.controller';
import { apiKeyAuth, requireScope } from '../middleware/api-auth.middleware';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();
const controller = new ApiV2Controller();

// Admin: Register API partner (requires admin auth)
router.post('/partners/register', authenticate, controller.registerPartner.bind(controller));

// API Partner authenticated routes
router.use(apiKeyAuth);

// Partner management
router.get('/partners/usage', controller.getUsageStats.bind(controller));
router.get('/partners/webhooks', controller.getWebhookEvents.bind(controller));
router.post('/partners/rotate-key', controller.rotateApiKey.bind(controller));

// Quote endpoints
router.post('/quotes', requireScope('quotes:read'), controller.getQuotes.bind(controller));

// Policy endpoints
router.post('/policies', requireScope('policies:write'), controller.createPolicy.bind(controller));
router.get('/policies/:policyId', requireScope('policies:read'), controller.getPolicyDetails.bind(controller));

// Claims endpoints
router.post('/claims', requireScope('claims:write'), controller.submitClaim.bind(controller));

export default router;
