import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Security headers middleware (enhanced for V2.0)
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;");
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Feature Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)');
  // HSTS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
}

/**
 * Request sanitization middleware
 */
export function requestSanitizer(req: Request, res: Response, next: NextFunction) {
  // Sanitize query parameters
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key] as string);
      }
    }
  }
  next();
}

/**
 * SQL Injection detection middleware
 */
export function sqlInjectionDetector(req: Request, res: Response, next: NextFunction) {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /('|"|`)\s*(OR|AND)\s*('|"|`)/i,
    /(\b1\s*=\s*1\b|\b0\s*=\s*0\b)/i,
  ];

  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  const combined = body + query;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(combined)) {
      logger.warn(`[SECURITY] SQL injection attempt detected: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        user_agent: req.get('user-agent'),
        body: req.body,
      });

      // Don't block (could be false positive), but flag it
      (req as any).securityFlags = (req as any).securityFlags || [];
      (req as any).securityFlags.push('sql_injection_pattern');
      break;
    }
  }

  next();
}

/**
 * Brute force protection
 */
const loginAttempts = new Map<string, { count: number; firstAttempt: number; blocked: boolean }>();

export function bruteForceProtection(maxAttempts: number = 5, windowMs: number = 900000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.body?.email || req.body?.phone || 'unknown'}`;
    const now = Date.now();
    const record = loginAttempts.get(key);

    if (record) {
      if (now - record.firstAttempt > windowMs) {
        // Reset window
        loginAttempts.set(key, { count: 1, firstAttempt: now, blocked: false });
      } else if (record.count >= maxAttempts) {
        logger.warn(`[SECURITY] Brute force blocked: ${key}`);
        return res.status(429).json({
          success: false,
          error: { code: 'TOO_MANY_ATTEMPTS', message: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.' },
        });
      } else {
        record.count++;
      }
    } else {
      loginAttempts.set(key, { count: 1, firstAttempt: now, blocked: false });
    }

    // Cleanup old entries periodically
    if (loginAttempts.size > 10000) {
      for (const [k, v] of loginAttempts) {
        if (now - v.firstAttempt > windowMs) loginAttempts.delete(k);
      }
    }

    next();
  };
}

/**
 * IP allowlist/blocklist middleware
 */
const blockedIPs = new Set<string>();
const allowedIPs = new Set<string>();

export function ipFilter(mode: 'allowlist' | 'blocklist' = 'blocklist') {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '';

    if (mode === 'blocklist' && blockedIPs.has(ip)) {
      return res.status(403).json({ success: false, error: { code: 'IP_BLOCKED', message: 'Access denied' } });
    }

    if (mode === 'allowlist' && allowedIPs.size > 0 && !allowedIPs.has(ip)) {
      return res.status(403).json({ success: false, error: { code: 'IP_NOT_ALLOWED', message: 'Access denied' } });
    }

    next();
  };
}

export function addBlockedIP(ip: string) { blockedIPs.add(ip); }
export function removeBlockedIP(ip: string) { blockedIPs.delete(ip); }
export function addAllowedIP(ip: string) { allowedIPs.add(ip); }

/**
 * Security audit logging
 */
export function securityAuditLog(req: Request, res: Response, next: NextFunction) {
  const sensitiveEndpoints = ['/auth/login', '/auth/register', '/admin', '/api/v2/partners'];

  const isSensitive = sensitiveEndpoints.some(ep => req.originalUrl.includes(ep));

  if (isSensitive) {
    res.on('finish', () => {
      logger.info(`[SECURITY_AUDIT] ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        status: res.statusCode,
        user_id: (req as any).user?.id,
        user_agent: req.get('user-agent'),
        flags: (req as any).securityFlags || [],
      });
    });
  }

  next();
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}
