import { Router } from 'express';
import { EmailCampaignController } from '../controllers/email-campaign.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

// Tracking endpoints (no auth - accessed from email)
router.get('/:campaignId/track/open', EmailCampaignController.trackOpen);
router.get('/:campaignId/track/click', EmailCampaignController.trackClick);

// Admin campaign management (authenticated)
router.use(authenticate);

router.get('/', EmailCampaignController.listCampaigns);
router.post('/', EmailCampaignController.createCampaign);
router.get('/:campaignId/stats', EmailCampaignController.getCampaignStats);
router.post('/:campaignId/send', EmailCampaignController.sendCampaign);

// Templates
router.get('/templates', EmailCampaignController.listTemplates);
router.post('/templates', EmailCampaignController.createTemplate);

export default router;
