import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/environment';
import { AppDataSource } from './config/database';
import { logger } from './shared/utils/logger';
import { errorHandler } from './shared/middleware/errorHandler';
import { globalRateLimiter } from './shared/middleware/rateLimiter';
import authRoutes from './modules/auth/routes/auth.routes';
import productRoutes from './modules/products/routes/product.routes';
import adminRoutes from './modules/admin/routes/admin.routes';
import quotationRoutes from './modules/quotation/routes/quotation.routes';
import integrationRoutes from './modules/insurer-integration/routes/integration.routes';
import purchaseRoutes, { paymentCallbackRouter } from './modules/purchase/routes/purchase.routes';
import comparisonRoutes from './modules/products/routes/comparison.routes';
import claimsRoutes, { adminClaimsRouter } from './modules/claims/routes/claims.routes';

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? ['https://insurance-system.vn']
    : ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime(),
  });
});

// API Info
app.get('/api/v1', (_req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Insurance System API v1',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        products: '/api/v1/products',
        categories: '/api/v1/products/categories',
        insurers: '/api/v1/products/insurers',
        quotations: '/api/v1/quotations',
        purchase: '/api/v1/purchase',
        integrations: '/api/v1/integrations',
        admin: '/api/v1/admin',
      },
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/purchase', purchaseRoutes);
app.use('/api/v1/purchase', paymentCallbackRouter);
app.use('/api/v1/products', comparisonRoutes);
app.use('/api/v1/claims', claimsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/claims', adminClaimsRouter);
app.use('/api/v1/integrations', integrationRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint không tồn tại',
    },
  });
});

// Error handler
app.use(errorHandler);

// Bootstrap
async function bootstrap() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connected successfully');

    // Start server
    app.listen(env.PORT, () => {
      logger.info(`🚀 Insurance System API running on port ${env.PORT}`);
      logger.info(`📋 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API: http://localhost:${env.PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
