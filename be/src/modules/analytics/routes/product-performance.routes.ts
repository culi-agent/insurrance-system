import { Router } from 'express';
import { ProductPerformanceController } from '../controllers/product-performance.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Full product performance report
router.get('/report', ProductPerformanceController.getReport);

// Product ranking/leaderboard
router.get('/ranking', ProductPerformanceController.getRanking);

// Single product detail
router.get('/products/:productId', ProductPerformanceController.getProductDetail);

export default router;
