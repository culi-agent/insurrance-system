import { Router } from 'express';
import { QuoteController } from '../controllers/quote.controller';
import { validate } from '../../../shared/middleware/validate';
import { authenticate } from '../../../shared/middleware/authenticate';
import {
  motorQuoteSchema,
  healthQuoteSchema,
  travelQuoteSchema,
} from '../validators/quote.validator';

const router = Router();
const quoteController = new QuoteController();

// Public routes (guest can get quotes, auth optional)
router.post('/motor', validate(motorQuoteSchema), quoteController.generateMotorQuote);
router.post('/health', validate(healthQuoteSchema), quoteController.generateHealthQuote);
router.post('/travel', validate(travelQuoteSchema), quoteController.generateTravelQuote);

// Public - get a specific quote by ID
router.get('/:id', quoteController.getQuoteById);

// Protected - user's saved quotes
router.get('/', authenticate, quoteController.getMyQuotes);

export default router;
