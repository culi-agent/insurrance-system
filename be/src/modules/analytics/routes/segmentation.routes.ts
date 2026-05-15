import { Router } from 'express';
import { SegmentationController } from '../controllers/segmentation.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// RFM Analysis
router.post('/rfm/run', SegmentationController.runRFMAnalysis);
router.get('/rfm/overview', SegmentationController.getSegmentsOverview);
router.get('/rfm/segment/:segmentName', SegmentationController.getCustomersBySegment);

// Custom Segments
router.get('/segments', SegmentationController.listSegments);
router.post('/segments', SegmentationController.createSegment);
router.get('/segments/:segmentId/customers', SegmentationController.getSegmentCustomerIds);

// Customer LTV
router.get('/customers/:customerId/ltv', SegmentationController.getCustomerLTV);

export default router;
