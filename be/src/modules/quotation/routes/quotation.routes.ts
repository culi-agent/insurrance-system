import { Router } from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { LifeQuotationController } from '../controllers/life-quotation.controller';
import { HomeQuotationController } from '../controllers/home-quotation.controller';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validate } from '../../../shared/middleware/validate';
import { motorQuoteSchema, travelQuoteSchema, healthQuoteSchema } from '../validators/quotation.validator';

const router = Router();
const quotationController = new QuotationController();

// Public routes - Motor (anonymous users can get quick quotes)
router.post('/motor/quick', validate(motorQuoteSchema), quotationController.getQuickMotorQuote);
router.post('/motor/compare', validate(motorQuoteSchema), quotationController.getMultiInsurerQuotes);

// Public routes - Travel
router.post('/travel/quick', validate(travelQuoteSchema), quotationController.getQuickTravelQuote);
router.post('/travel/compare', validate(travelQuoteSchema), quotationController.getMultiInsurerTravelQuotes);

// Public routes - Health
router.post('/health/quick', validate(healthQuoteSchema), quotationController.getQuickHealthQuote);
router.post('/health/compare', validate(healthQuoteSchema), quotationController.getMultiInsurerHealthQuotes);

// Public routes - Life Insurance
router.post('/life/quick', LifeQuotationController.getQuickQuote);
router.get('/life/riders', LifeQuotationController.getRiders);
router.get('/life/payment-options', LifeQuotationController.getPaymentOptions);

// Public routes - Home Insurance
router.post('/home/quick', HomeQuotationController.getQuickQuote);
router.post('/home/compare-plans', HomeQuotationController.comparePlans);
router.get('/home/coverage-options', HomeQuotationController.getCoverageOptions);

// Protected routes (require login to save quotes)
router.post('/motor', authenticate, validate(motorQuoteSchema), quotationController.createMotorQuote);
router.post('/travel', authenticate, validate(travelQuoteSchema), quotationController.createTravelQuote);
router.post('/health', authenticate, validate(healthQuoteSchema), quotationController.createHealthQuote);
router.post('/life', authenticate, LifeQuotationController.createQuote);
router.get('/life/:quotationId/illustration', authenticate, LifeQuotationController.getIllustration);
router.post('/life/underwriting', authenticate, LifeQuotationController.runUnderwriting);
router.post('/home', authenticate, HomeQuotationController.createQuote);
router.get('/my', authenticate, quotationController.getMyQuotations);
router.get('/:id', authenticate, quotationController.getQuotationById);
router.post('/:id/accept', authenticate, quotationController.acceptQuote);

export default router;
