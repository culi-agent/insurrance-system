import { Router } from 'express';
import { LoyaltyController } from '../controllers/loyalty.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();
const controller = new LoyaltyController();

router.use(authenticate);

// Account & Points
router.get('/account', controller.getAccount.bind(controller));
router.get('/history', controller.getPointHistory.bind(controller));

// Redemption
router.get('/redemptions', controller.getRedemptionOptions.bind(controller));
router.post('/redeem', controller.redeemPoints.bind(controller));

// Badges & Achievements
router.get('/badges', controller.getBadges.bind(controller));
router.post('/achievements/check', controller.checkAchievements.bind(controller));

// Referral Tiers
router.get('/referral-tiers', controller.getReferralTiers.bind(controller));

export default router;
