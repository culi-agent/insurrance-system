import { Router } from 'express';
import { BusinessInsuranceController } from '../controllers/business-insurance.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();
const controller = new BusinessInsuranceController();

router.use(authenticate);

// Business Property Insurance
router.post('/property/quote', controller.getPropertyQuote.bind(controller));

// Liability Insurance
router.post('/liability/quote', controller.getLiabilityQuote.bind(controller));

// Business Interruption Insurance
router.post('/interruption/quote', controller.getInterruptionQuote.bind(controller));

// Purchase
router.post('/purchase', controller.purchaseBusinessInsurance.bind(controller));

export default router;
