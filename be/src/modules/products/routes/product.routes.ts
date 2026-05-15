import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();
const productController = new ProductController();

// Product routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/compare', productController.compareProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// Category routes
router.get('/categories', productController.getCategories);
router.get('/categories/:slug', productController.getCategoryBySlug);
router.get('/categories/:slug/products', productController.getProductsByCategory);

// Insurer routes
router.get('/insurers', productController.getInsurers);

export default router;
