import { Router } from 'express';
import { SmartPrefillController } from '../controllers/smart-prefill.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Get pre-fill data (can specify insurance_type query param)
router.get('/prefill', SmartPrefillController.getPrefillData);

// Save form data for learning
router.post('/prefill', SmartPrefillController.saveFormData);

export default router;
