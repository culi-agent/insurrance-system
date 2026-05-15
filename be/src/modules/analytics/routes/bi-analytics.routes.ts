import { Router } from 'express';
import { BIAnalyticsController } from '../controllers/bi-analytics.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();
const controller = new BIAnalyticsController();

router.use(authenticate);

// BI Dashboard
router.get('/bi/dashboard', controller.getDashboard.bind(controller));

// Financial Reconciliation
router.get('/bi/reconciliation', controller.getReconciliation.bind(controller));

// Year-end Report
router.get('/bi/year-end/:year', controller.getYearEndReport.bind(controller));

// Custom Report Builder
router.post('/bi/custom-report', controller.buildCustomReport.bind(controller));

export default router;
