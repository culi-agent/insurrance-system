import { Router } from 'express';
import { PartnerPortalController } from '../controllers/partner-portal.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Partner dashboard
router.get('/dashboard', PartnerPortalController.getDashboard);
router.get('/:partnerId/dashboard', PartnerPortalController.getDashboard);

// Products
router.get('/products', PartnerPortalController.getProducts);
router.get('/:partnerId/products', PartnerPortalController.getProducts);

// Performance metrics
router.get('/performance', PartnerPortalController.getPerformance);
router.get('/:partnerId/performance', PartnerPortalController.getPerformance);

// Policies
router.get('/policies', PartnerPortalController.getPolicies);
router.get('/:partnerId/policies', PartnerPortalController.getPolicies);

// Claims
router.get('/claims', PartnerPortalController.getClaims);
router.get('/:partnerId/claims', PartnerPortalController.getClaims);

export default router;
