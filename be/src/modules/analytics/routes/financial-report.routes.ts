import { Router } from 'express';
import { FinancialReportController } from '../controllers/financial-report.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Full financial report
router.get('/report', FinancialReportController.getReport);

// Monthly P&L trend
router.get('/pnl', FinancialReportController.getMonthlyPnL);

// Commission statement per insurer
router.get('/commission/:insurerId', FinancialReportController.getCommissionStatement);

export default router;
