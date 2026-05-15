import { Router } from 'express';
import { RecommendationV2Controller } from '../controllers/recommendation-v2.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

// Trending (public)
router.get('/trending', RecommendationV2Controller.getTrending);

// Authenticated routes
router.use(authenticate);

// ML-enhanced recommendations
router.get('/personalized', RecommendationV2Controller.getRecommendations);

// Behavior tracking
router.post('/behavior', RecommendationV2Controller.trackBehavior);

// Interaction tracking
router.post('/interaction', RecommendationV2Controller.trackInteraction);

export default router;
