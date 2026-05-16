import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
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
import beneficiaryRoutes from './modules/purchase/routes/beneficiary.routes';
import comparisonRoutes from './modules/products/routes/comparison.routes';
import claimsRoutes, { adminClaimsRouter } from './modules/claims/routes/claims.routes';
// Sprint 11: Renewal & Referral
import renewalRoutes, { renewalAdminRouter } from './modules/renewal/routes/renewal.routes';
import referralRoutes from './modules/referral/routes/referral.routes';
// Sprint 12: Analytics
import analyticsRoutes from './modules/analytics/routes/analytics.routes';
// Sprint 14: Recommendations
import recommendationRoutes from './modules/recommendation/routes/recommendation.routes';
// Sprint 15: A/B Testing
import abTestingRoutes, { abTestingAdminRouter } from './modules/ab-testing/routes/ab-testing.routes';
// Sprint 16: Mobile APIs, Advanced Analytics
import mobilePurchaseRoutes from './modules/mobile/routes/mobile-purchase.routes';
import mobileDashboardRoutes from './modules/mobile/routes/mobile-dashboard.routes';
import pushNotificationRoutes, { pushNotificationAdminRouter } from './modules/mobile/routes/push-notification.routes';
import segmentationRoutes from './modules/analytics/routes/segmentation.routes';
import customerAnalyticsRoutes from './modules/analytics/routes/customer-analytics.routes';
import productPerformanceRoutes from './modules/analytics/routes/product-performance.routes';
import financialReportRoutes from './modules/analytics/routes/financial-report.routes';
import reportExportRoutes from './modules/analytics/routes/report-export.routes';
import smartPrefillRoutes from './modules/quotation/routes/smart-prefill.routes';
// Sprint 17: Mobile Claims, AI v2, Partner Portal, Email Campaigns, CMS
import mobileClaimsRoutes from './modules/mobile/routes/mobile-claims.routes';
import mobileClaimsTrackingRoutes from './modules/mobile/routes/mobile-claims-tracking.routes';
import mobileProfileRoutes from './modules/mobile/routes/mobile-profile.routes';
import recommendationV2Routes from './modules/recommendation/routes/recommendation-v2.routes';
import emailCampaignRoutes from './modules/notifications/routes/email-campaign.routes';
import scheduledNotificationRoutes from './modules/notifications/routes/scheduled-notification.routes';
import partnerPortalRoutes from './modules/partner/routes/partner-portal.routes';
import cmsRoutes from './modules/admin/routes/cms.routes';
import systemConfigRoutes from './modules/admin/routes/system-config.routes';
// Sprint 18: Performance & Monitoring
import { responseTimeTracker, compressionHints, paginationLimiter } from './shared/middleware/performance';
import { metricsMiddleware, metrics, alerting } from './shared/middleware/monitoring';
// Sprint 19: Enterprise / B2B
import enterpriseRoutes from './modules/enterprise/routes/enterprise.routes';
import businessInsuranceRoutes from './modules/enterprise/routes/business-insurance.routes';
// Sprint 20: API v2
import apiV2Routes from './modules/api-v2/routes/api-v2.routes';
// Sprint 21: White-label & Bancassurance
import whitelabelRoutes from './modules/whitelabel/routes/whitelabel.routes';
// Sprint 22: Loyalty, Chatbot, Surveys, Fraud Detection
import loyaltyRoutes from './modules/loyalty/routes/loyalty.routes';
import surveyRoutes from './modules/loyalty/routes/survey.routes';
import chatbotRoutes from './modules/chatbot/routes/chatbot.routes';
import fraudDetectionRoutes from './modules/claims/routes/fraud-detection.routes';
// Sprint 23-24: Security, Scaling, BI Analytics
import { securityHeaders, requestSanitizer, sqlInjectionDetector, securityAuditLog } from './shared/middleware/security-audit';
import biAnalyticsRoutes from './modules/analytics/routes/bi-analytics.routes';
// Swagger API Documentation
import { setupSwagger } from './docs/swagger-setup';
// CSRF Protection
import { csrfTokenProvider, csrfProtection } from './shared/middleware/csrf';
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
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalRateLimiter);
// Sprint 18: Performance & Monitoring middleware
app.use(responseTimeTracker);
app.use(metricsMiddleware);
app.use(compressionHints);
app.use(paginationLimiter(100));
// Sprint 23: Security middleware
app.use(securityHeaders);
app.use(requestSanitizer);
app.use(sqlInjectionDetector);
app.use(securityAuditLog);
// CSRF Protection (after cookie-parser, before routes)
app.use(csrfTokenProvider);
app.use(csrfProtection);

// API Documentation (Swagger UI at /api/docs)
setupSwagger(app);

// Health check
app.get('/health', (_req, res) => {
  const health = metrics.getMetrics();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    response_time_p95: health.response_time.p95,
    memory_mb: health.memory.heap_used_mb,
  });
});

// Detailed health check (internal)
app.get('/health/detailed', (_req, res) => {
  res.json(metrics.getMetrics());
});

// Alerts endpoint
app.get('/health/alerts', (_req, res) => {
  alerting.checkThresholds();
  res.json(alerting.getAlerts());
});

// API Info
app.get('/api/v1', (_req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Insurance System API v1',
      version: '2.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        products: '/api/v1/products',
        categories: '/api/v1/products/categories',
        insurers: '/api/v1/products/insurers',
        quotations: '/api/v1/quotations',
        purchase: '/api/v1/purchase',
        claims: '/api/v1/claims',
        renewal: '/api/v1/renewal',
        referrals: '/api/v1/referrals',
        recommendations: '/api/v1/recommendations',
        recommendations_v2: '/api/v1/recommendations/v2',
        integrations: '/api/v1/integrations',
        ab_testing: '/api/v1/ab-testing',
        mobile: '/api/v1/mobile',
        partner: '/api/v1/partner',
        cms: '/api/v1/cms',
        campaigns: '/api/v1/campaigns',
        enterprise: '/api/v1/enterprise',
        business_insurance: '/api/v1/enterprise/insurance',
        loyalty: '/api/v1/loyalty',
        chatbot: '/api/v1/chatbot',
        surveys: '/api/v1/surveys',
        whitelabel: '/api/v1/whitelabel',
        api_v2: '/api/v2',
        admin: '/api/v1/admin',
        analytics: '/api/v1/admin/analytics',
        bi_analytics: '/api/v1/admin/analytics/bi',
      },
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/quotations', smartPrefillRoutes);
app.use('/api/v1/purchase', purchaseRoutes);
app.use('/api/v1/purchase', paymentCallbackRouter);
app.use('/api/v1/purchase', beneficiaryRoutes);
app.use('/api/v1/products', comparisonRoutes);
app.use('/api/v1/claims', claimsRoutes);
app.use('/api/v1/renewal', renewalRoutes);
app.use('/api/v1/referrals', referralRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/recommendations/v2', recommendationV2Routes);
app.use('/api/v1/ab-testing', abTestingRoutes);
app.use('/api/v1/integrations', integrationRoutes);

// Sprint 16-17: Mobile API Routes
app.use('/api/v1/mobile', mobilePurchaseRoutes);
app.use('/api/v1/mobile', mobileDashboardRoutes);
app.use('/api/v1/mobile', mobileProfileRoutes);
app.use('/api/v1/mobile/notifications', pushNotificationRoutes);
app.use('/api/v1/mobile/claims', mobileClaimsRoutes);
app.use('/api/v1/mobile/claims/tracking', mobileClaimsTrackingRoutes);

// Sprint 17: Partner Portal
app.use('/api/v1/partner', partnerPortalRoutes);

// Sprint 17: CMS (public + admin)
app.use('/api/v1/cms', cmsRoutes);

// Sprint 17: Email Campaigns
app.use('/api/v1/campaigns', emailCampaignRoutes);

// Sprint 19: Enterprise / B2B
app.use('/api/v1/enterprise', enterpriseRoutes);
app.use('/api/v1/enterprise/insurance', businessInsuranceRoutes);

// Sprint 20: API v2 (separate versioned path)
app.use('/api/v2', apiV2Routes);

// Sprint 21: White-label & Bancassurance
app.use('/api/v1/whitelabel', whitelabelRoutes);

// Sprint 22: Loyalty, Chatbot, Surveys
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/surveys', surveyRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);

// Admin Routes
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/claims', adminClaimsRouter);
app.use('/api/v1/admin/analytics', analyticsRoutes);
app.use('/api/v1/admin/analytics/customers', customerAnalyticsRoutes);
app.use('/api/v1/admin/analytics/products', productPerformanceRoutes);
app.use('/api/v1/admin/analytics/financial', financialReportRoutes);
app.use('/api/v1/admin/analytics/segmentation', segmentationRoutes);
app.use('/api/v1/admin/analytics', reportExportRoutes);
app.use('/api/v1/admin/renewal', renewalAdminRouter);
app.use('/api/v1/admin/ab-testing', abTestingAdminRouter);
app.use('/api/v1/admin/notifications', pushNotificationAdminRouter);
app.use('/api/v1/admin/scheduler', scheduledNotificationRoutes);
app.use('/api/v1/admin/config', systemConfigRoutes);

// Sprint 22: Fraud Detection (admin)
app.use('/api/v1/admin/fraud', fraudDetectionRoutes);

// Sprint 24: BI Analytics (admin)
app.use('/api/v1/admin/analytics', biAnalyticsRoutes);

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
