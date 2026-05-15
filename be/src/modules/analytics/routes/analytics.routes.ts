import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../../../shared/middleware/authenticate';

const router = Router();

// All analytics routes require admin auth
router.use(authenticate);
router.use(authorize('admin'));

// KPI dashboard
router.get('/kpis', AnalyticsController.getKPIs);

// Sales reports
router.get('/sales', AnalyticsController.getSalesReport);

// Conversion funnel
router.get('/funnel', AnalyticsController.getConversionFunnel);

// Revenue breakdown
router.get('/revenue', AnalyticsController.getRevenueBreakdown);

// Audit logs
router.get('/audit-logs', AnalyticsController.getAuditLogs);

// Export report
router.get('/export', AnalyticsController.exportReport);

export default router;
