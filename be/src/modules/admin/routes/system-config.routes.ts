import { Router } from 'express';
import { SystemConfigController } from '../controllers/system-config.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', SystemConfigController.getAll);
router.get('/categories', SystemConfigController.getCategories);
router.get('/:key', SystemConfigController.get);
router.post('/', SystemConfigController.set);
router.delete('/:key', SystemConfigController.delete);
router.post('/init-defaults', SystemConfigController.initDefaults);

export default router;
