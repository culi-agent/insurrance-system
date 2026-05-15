import { Router } from 'express';
import { PushNotificationController } from '../controllers/push-notification.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Device management
router.post('/devices', PushNotificationController.registerDevice);
router.delete('/devices/:deviceId', PushNotificationController.unregisterDevice);

// Notification preferences
router.get('/preferences', PushNotificationController.getPreferences);
router.put('/preferences', PushNotificationController.updatePreferences);

// Notification history
router.get('/history', PushNotificationController.getHistory);
router.get('/unread-count', PushNotificationController.getUnreadCount);
router.put('/history/:notificationId/read', PushNotificationController.markAsRead);
router.put('/history/read-all', PushNotificationController.markAllAsRead);

export default router;

// Admin push notification routes
export const pushNotificationAdminRouter = Router();
pushNotificationAdminRouter.use(authenticate);
pushNotificationAdminRouter.post('/send', PushNotificationController.adminSendNotification);
pushNotificationAdminRouter.post('/send-batch', PushNotificationController.adminSendBatch);
