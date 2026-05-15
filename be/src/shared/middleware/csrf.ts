import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../../config/environment';
import { logger } from '../utils/logger';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Middleware: Set CSRF token cookie on every response.
 * The cookie is NOT HttpOnly so frontend JS can read it and send it back as a header.
 */
export function csrfTokenProvider(req: Request, res: Response, next: NextFunction): void {
  // Only set CSRF cookie if one doesn't already exist
  if (!req.cookies?.[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken();
    const isProduction = env.NODE_ENV === 'production';

    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Frontend must be able to read this
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      domain: isProduction ? env.COOKIE_DOMAIN : undefined,
    });
  }

  next();
}

/**
 * Middleware: Validate CSRF token on state-changing requests (POST, PUT, PATCH, DELETE).
 * Uses the double-submit cookie pattern:
 * - CSRF token is stored in a non-HttpOnly cookie (set by csrfTokenProvider)
 * - Frontend reads the cookie and sends it in the X-CSRF-Token header
 * - This middleware validates that the header matches the cookie
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Only validate on state-changing methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  // Skip CSRF for API-key authenticated requests (e.g., partner integrations)
  if (req.headers['x-api-key']) {
    return next();
  }

  // Skip CSRF for requests using Bearer token (mobile/API clients, not cookie-based)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Get the CSRF token from cookie and header
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  // Validate: both must be present and match
  if (!cookieToken || !headerToken) {
    logger.warn(`[CSRF] Missing CSRF token - cookie: ${!!cookieToken}, header: ${!!headerToken}`, {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      user_agent: req.get('user-agent'),
    });

    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_VALIDATION_FAILED',
        message: 'CSRF token missing. Please refresh the page and try again.',
      },
    });
    return;
  }

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    logger.warn(`[CSRF] Token mismatch`, {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      user_agent: req.get('user-agent'),
    });

    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_VALIDATION_FAILED',
        message: 'CSRF token invalid. Please refresh the page and try again.',
      },
    });
    return;
  }

  next();
}
