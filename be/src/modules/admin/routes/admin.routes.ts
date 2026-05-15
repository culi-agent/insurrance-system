import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../../../shared/middleware/authenticate';
import { requireRoles, requirePermission } from '../../../shared/middleware/rbac';
import { validate } from '../../../shared/middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  createInsurerSchema,
  updateInsurerSchema,
  updateCustomerStatusSchema,
} from '../validators/admin.validator';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication + admin/superadmin role
router.use(authenticate);
router.use(requireRoles('admin', 'superadmin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Product management
router.get('/products', adminController.getProducts);
router.post('/products', validate(createProductSchema), adminController.createProduct);
router.put('/products/:id', validate(updateProductSchema), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Category management
router.get('/categories', adminController.getCategories);
router.post('/categories', validate(createCategorySchema), adminController.createCategory);
router.put('/categories/:id', validate(updateCategorySchema), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Insurer management
router.get('/insurers', adminController.getInsurers);
router.post('/insurers', validate(createInsurerSchema), adminController.createInsurer);
router.put('/insurers/:id', validate(updateInsurerSchema), adminController.updateInsurer);
router.delete('/insurers/:id', adminController.deleteInsurer);

// Customer management
router.get('/customers', adminController.getCustomers);
router.patch('/customers/:id/status', validate(updateCustomerStatusSchema), adminController.updateCustomerStatus);

export default router;
