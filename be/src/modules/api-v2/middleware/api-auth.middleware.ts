import { Request, Response, NextFunction } from 'express';
import { ApiV2Service } from '../services/api-v2.service';

const apiService = new ApiV2Service();

/**
 * API v2 Authentication Middleware
 * Supports: API Key (header), Bearer Token (OAuth)
 */
export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string || extractBearerToken(req);

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'API key required. Provide via X-API-Key header or Bearer token.' },
    });
  }

  try {
    const validation = await apiService.validateApiKey(apiKey);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_API_KEY', message: 'Invalid or inactive API key' },
      });
    }

    // Check rate limit
    const rateLimit = await apiService.checkRateLimit(validation.partner_id!);
    res.setHeader('X-RateLimit-Limit', validation.rate_limit!.toString());
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
    res.setHeader('X-RateLimit-Reset', rateLimit.reset_at);

    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded. Try again later.' },
        rate_limit: rateLimit,
      });
    }

    // Attach partner info to request
    (req as any).apiPartner = {
      id: validation.partner_id,
      name: validation.partner_name,
      scopes: validation.scopes,
      environment: validation.environment,
    };

    // Track usage after response
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      apiService.trackUsage(validation.partner_id!, req.originalUrl, req.method, res.statusCode, duration).catch(() => {});
    });

    next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Authentication service error' },
    });
  }
}

/**
 * Scope checker middleware factory
 */
export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const partner = (req as any).apiPartner;
    if (!partner || !partner.scopes.includes(scope)) {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_SCOPE', message: `Required scope: ${scope}` },
      });
    }
    next();
  };
}

/**
 * Sandbox-only restriction
 */
export function sandboxOnly(req: Request, res: Response, next: NextFunction) {
  const partner = (req as any).apiPartner;
  if (partner?.environment !== 'sandbox') {
    return res.status(403).json({
      success: false,
      error: { code: 'SANDBOX_ONLY', message: 'This endpoint is only available in sandbox environment' },
    });
  }
  next();
}

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}
