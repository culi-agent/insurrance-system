import { Router } from 'express';
import { CustomerAnalyticsController } from '../controllers/customer-analytics.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Full customer analytics report
router.get('/report', CustomerAnalyticsController.getReport);

// Retention metrics
router.get('/retention', CustomerAnalyticsController.getRetention);

// Cohort analysis
router.get('/cohort', CustomerAnalyticsController.getCohortAnalysis);

export default router;
