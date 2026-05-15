import { Router } from 'express';
import { FraudDetectionController } from '../controllers/fraud-detection.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();
const controller = new FraudDetectionController();

router.use(authenticate);

// Analyze claim for fraud
router.post('/:claimId/analyze', controller.analyzeClaim.bind(controller));

// Verify document
router.post('/:claimId/documents/:documentId/verify', controller.verifyDocument.bind(controller));

// Fraud analytics (admin)
router.get('/analytics', controller.getFraudAnalytics.bind(controller));

export default router;
