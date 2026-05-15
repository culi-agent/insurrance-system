import { Router } from 'express';
import { MobileDashboardController } from '../controllers/mobile-dashboard.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Dashboard overview (single API call for main screen)
router.get('/dashboard', MobileDashboardController.getOverview);

// Policies
router.get('/policies', MobileDashboardController.getPolicies);
router.get('/policies/:policyId', MobileDashboardController.getPolicyDetail);

// Claims
router.get('/claims', MobileDashboardController.getClaims);

export default router;
