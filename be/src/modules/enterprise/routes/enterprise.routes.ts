import { Router } from 'express';
import { EnterpriseController } from '../controllers/enterprise.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();
const controller = new EnterpriseController();

// Public: Registration
router.post('/register', controller.register.bind(controller));

// Protected: Require enterprise authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', controller.getDashboard.bind(controller));

// Employee Management
router.get('/employees', controller.listEmployees.bind(controller));
router.post('/employees', controller.addEmployees.bind(controller));
router.post('/employees/import', controller.importEmployees.bind(controller));
router.delete('/employees/:employeeId', controller.removeEmployee.bind(controller));

// Group Insurance
router.post('/group-quote', controller.getGroupQuote.bind(controller));
router.post('/group-purchase', controller.purchaseGroupInsurance.bind(controller));

// Billing
router.get('/billing', controller.getBilling.bind(controller));
router.post('/billing/invoice', controller.generateInvoice.bind(controller));

export default router;
