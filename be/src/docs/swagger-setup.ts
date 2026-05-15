import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

/**
 * Setup Swagger UI documentation at /api/docs
 */
export function setupSwagger(app: Express): void {
  // Serve Swagger UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Insurance System API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
      },
    }),
  );

  // Serve raw OpenAPI JSON spec
  app.get('/api/docs/json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Serve raw OpenAPI YAML spec (optional)
  app.get('/api/docs/yaml', (_req, res) => {
    // Convert to YAML would require js-yaml package
    // For now, redirect to JSON
    res.redirect('/api/docs/json');
  });
}
