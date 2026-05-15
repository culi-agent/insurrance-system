import { Router } from 'express';
import { PolicyController } from '../controllers/policy.controller';
import { authenticate } from '../../../shared/middleware/authenticate';
import { validate } from '../../../shared/middleware/validate';
import { createPolicySchema, cancelPolicySchema } from '../validators/policy.validator';

const router = Router();
const policyController = new PolicyController();

// All policy routes require authentication
router.use(authenticate);

router.get('/', policyController.getMyPolicies);
router.get('/:id', policyController.getPolicyById);
router.post('/', validate(createPolicySchema), policyController.createPolicy);
router.post('/:id/activate', policyController.activatePolicy);
router.post('/:id/cancel', validate(cancelPolicySchema), policyController.cancelPolicy);

export default router;
