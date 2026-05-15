import { Router } from 'express';
import { ScheduledNotificationController } from '../controllers/scheduled-notification.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Scheduler status
router.get('/status', ScheduledNotificationController.getStatus);

// Trigger jobs (admin/cron)
router.post('/run-all', ScheduledNotificationController.runAllJobs);
router.post('/process', ScheduledNotificationController.processNotifications);
router.post('/renewal-reminders', ScheduledNotificationController.generateRenewalReminders);

// Cancel
router.delete('/:notificationId', ScheduledNotificationController.cancelNotification);

export default router;
