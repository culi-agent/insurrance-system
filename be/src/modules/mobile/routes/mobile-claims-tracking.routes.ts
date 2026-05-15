import { Router } from 'express';
import { MobileClaimsTrackingController } from '../controllers/mobile-claims-tracking.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Unread messages count (for badge)
router.get('/unread-count', MobileClaimsTrackingController.getUnreadCount);

// Claim detail with full timeline
router.get('/:claimId', MobileClaimsTrackingController.getClaimDetail);

// Timeline only
router.get('/:claimId/timeline', MobileClaimsTrackingController.getTimeline);

// Messages/Communication
router.get('/:claimId/messages', MobileClaimsTrackingController.getMessages);
router.post('/:claimId/messages', MobileClaimsTrackingController.sendMessage);

// Withdraw claim
router.post('/:claimId/withdraw', MobileClaimsTrackingController.withdrawClaim);

export default router;
