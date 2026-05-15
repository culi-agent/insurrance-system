import { Router } from 'express';
import { WhitelabelController } from '../controllers/whitelabel.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();
const controller = new WhitelabelController();

// Public: Get config by domain (for whitelabel frontends)
router.get('/config/:domain', controller.getConfigByDomain.bind(controller));

// Public: Bancassurance products (for bank integrations)
router.get('/bancassurance/:bankCode/products', controller.getBancassuranceProducts.bind(controller));
router.post('/bancassurance/:bankCode/sale', controller.processBancassuranceSale.bind(controller));

// Admin routes
router.use(authenticate);
router.post('/config', controller.createConfig.bind(controller));
router.get('/configs', controller.listConfigs.bind(controller));
router.put('/config/:configId/branding', controller.updateBranding.bind(controller));
router.put('/config/:configId/features', controller.updateFeatures.bind(controller));
router.post('/bancassurance', controller.registerBancassurance.bind(controller));

export default router;
