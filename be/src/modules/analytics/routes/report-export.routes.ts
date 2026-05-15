import { Router } from 'express';
import { ReportExportController } from '../controllers/report-export.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Export report (CSV/PDF)
router.post('/export', ReportExportController.exportReport);

// Export history
router.get('/exports/history', ReportExportController.getExportHistory);

export default router;
