import { Router } from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validate } from '../../../shared/middleware/validate';
import { motorQuoteSchema } from '../validators/quotation.validator';

const router = Router();
const quotationController = new QuotationController();

// Public routes (anonymous users can get quick quotes)
router.post('/motor/quick', validate(motorQuoteSchema), quotationController.getQuickMotorQuote);
router.post('/motor/compare', validate(motorQuoteSchema), quotationController.getMultiInsurerQuotes);

// Protected routes (require login to save quotes)
router.post('/motor', authenticate, validate(motorQuoteSchema), quotationController.createMotorQuote);
router.get('/my', authenticate, quotationController.getMyQuotations);
router.get('/:id', authenticate, quotationController.getQuotationById);
router.post('/:id/accept', authenticate, quotationController.acceptQuote);

export default router;
