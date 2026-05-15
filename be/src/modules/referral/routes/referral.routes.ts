import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller';
import { authMiddleware } from '../../../shared/middleware/auth';

const router = Router();

router.use(authMiddleware);

// Generate referral code
router.post('/generate', ReferralController.generateCode);

// Get referral stats
router.get('/stats', ReferralController.getStats);

// Get my referrals list
router.get('/list', ReferralController.getMyReferrals);

export default router;
