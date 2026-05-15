import { Router } from 'express';
import { BeneficiaryController } from '../controllers/beneficiary.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();
router.use(authenticate);

// Beneficiary management
router.get('/policies/:policyId/beneficiaries', BeneficiaryController.getBeneficiaries);
router.post('/policies/:policyId/beneficiaries', BeneficiaryController.setBeneficiaries);
router.put('/policies/:policyId/beneficiaries/:beneficiaryId', BeneficiaryController.updateBeneficiary);
router.delete('/policies/:policyId/beneficiaries/:beneficiaryId', BeneficiaryController.removeBeneficiary);

// Installment payment
router.post('/installments', BeneficiaryController.createInstallmentPlan);
router.get('/policies/:policyId/installments', BeneficiaryController.getInstallmentPlan);
router.post('/installments/:planId/pay', BeneficiaryController.recordPayment);

export default router;
