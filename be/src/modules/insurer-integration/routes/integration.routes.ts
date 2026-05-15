import { Router, Request, Response, NextFunction } from 'express';
import { InsurerRegistry } from '../registry';
import { authenticate } from '../../../shared/middleware/authenticate';
import { requireRoles } from '../../../shared/middleware/rbac';
import { AuthenticatedRequest } from '../../../shared/types';

const router = Router();

/**
 * GET /api/v1/integrations/insurers
 * List available insurer integrations (public)
 */
router.get('/insurers', (_req: Request, res: Response) => {
  const registry = InsurerRegistry.getInstance();
  const insurers = registry.getAvailableInsurers();

  res.json({
    success: true,
    data: insurers,
  });
});

/**
 * GET /api/v1/integrations/health
 * Health check all insurer APIs (admin only)
 */
router.get(
  '/health',
  authenticate,
  requireRoles('admin', 'superadmin'),
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const registry = InsurerRegistry.getInstance();
      const health = await registry.checkAllHealth();

      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/v1/integrations/quotes
 * Get multi-insurer quotes (authenticated)
 */
router.post(
  '/quotes',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const registry = InsurerRegistry.getInstance();
      const result = await registry.getMultiInsurerQuotes(req.body);

      res.json({
        success: true,
        data: {
          quotes: result.quotes,
          total_quotes: result.quotes.length,
          errors: result.errors.length > 0 ? result.errors : undefined,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
