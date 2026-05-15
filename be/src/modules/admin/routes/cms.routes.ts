import { Router } from 'express';
import { CMSController } from '../controllers/cms.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

// Public routes
router.get('/pages/:slug', CMSController.getPage);
router.get('/faqs', CMSController.listFAQs);
router.post('/faqs/:id/vote', CMSController.voteFAQ);

// Admin routes
router.use(authenticate);
router.get('/pages', CMSController.listPages);
router.post('/pages', CMSController.createPage);
router.put('/pages/:id', CMSController.updatePage);
router.delete('/pages/:id', CMSController.deletePage);
router.post('/faqs', CMSController.createFAQ);
router.put('/faqs/:id', CMSController.updateFAQ);

export default router;
