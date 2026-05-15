import { Router } from 'express';
import { MobileProfileController } from '../controllers/mobile-profile.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Profile
router.get('/profile', MobileProfileController.getProfile);
router.put('/profile', MobileProfileController.updateProfile);
router.post('/profile/change-password', MobileProfileController.changePassword);
router.post('/profile/delete-account', MobileProfileController.requestDeletion);

// App Settings
router.get('/settings', MobileProfileController.getSettings);
router.put('/settings', MobileProfileController.updateSettings);

// Security
router.get('/security', MobileProfileController.getSecuritySettings);
router.delete('/security/sessions/:sessionId', MobileProfileController.logoutSession);
router.post('/security/logout-all', MobileProfileController.logoutAllSessions);

export default router;
