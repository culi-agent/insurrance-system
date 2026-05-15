import { Router } from 'express';
import { SurveyController } from '../controllers/survey.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();
const controller = new SurveyController();

// Public: Get survey for event
router.get('/event/:event', controller.getSurveyForEvent.bind(controller));

// Protected
router.use(authenticate);
router.post('/response', controller.submitResponse.bind(controller));

// Admin
router.post('/', controller.createSurvey.bind(controller));
router.get('/analytics/nps', controller.getNPSAnalytics.bind(controller));
router.get('/analytics/csat', controller.getCSATAnalytics.bind(controller));

export default router;
