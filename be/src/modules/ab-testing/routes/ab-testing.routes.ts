import { Router } from 'express';
import { ABTestingController } from '../controllers/ab-testing.controller';
import { authenticate, authorize } from '../../../shared/middleware/authenticate';

const router = Router();

// Client-facing routes (get assignments, track events)
router.get('/assign/:featureKey', ABTestingController.getAssignment);
router.post('/track', ABTestingController.trackEvent);

// Admin routes
export const abTestingAdminRouter = Router();
abTestingAdminRouter.use(authenticate);
abTestingAdminRouter.use(authorize('admin'));
abTestingAdminRouter.post('/experiments', ABTestingController.createExperiment);
abTestingAdminRouter.get('/experiments', ABTestingController.listExperiments);
abTestingAdminRouter.get('/experiments/:experimentId/results', ABTestingController.getResults);
abTestingAdminRouter.patch('/experiments/:experimentId/status', ABTestingController.updateStatus);

export default router;
