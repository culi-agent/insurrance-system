import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Get personalized recommendations
router.get('/', RecommendationController.getRecommendations);

// Get coverage gap analysis
router.get('/coverage-gaps', RecommendationController.getCoverageGaps);

// Get "also bought" suggestions
router.get('/also-bought/:insuranceType', RecommendationController.getAlsoBought);

export default router;
