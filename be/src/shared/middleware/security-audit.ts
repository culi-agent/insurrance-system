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
 * SQL Injection detection and blocking middleware.
 *
 * Uses a two-tier approach:
 * - HIGH confidence patterns: Block the request immediately (return 403)
 * - LOW confidence patterns: Flag and log but allow through (may be false positive)
 *
 * High-confidence patterns are combinations that are almost never legitimate user input.
 */
export function sqlInjectionDetector(req: Request, res: Response, next: NextFunction) {
  // HIGH CONFIDENCE: These patterns are almost certainly SQL injection attacks.
  // They combine multiple SQL indicators that legitimate users would never type.
  const highConfidencePatterns = [
    // Classic tautology injections: ' OR 1=1 --, " OR ""="
    /('|"|`)\s*(OR|AND)\s+\d+\s*=\s*\d+/i,
    // Tautology: ' OR 'a'='a, " OR "x"="x
    /('|"|`)\s*(OR|AND)\s*('|"|`)\w*('|"|`)\s*=\s*('|"|`)/i,
    // UNION SELECT - extracting data from other tables
    /UNION\s+(ALL\s+)?SELECT\s+/i,
    // Stacked queries with dangerous commands: ; DROP TABLE, ; DELETE FROM
    /;\s*(DROP|DELETE|TRUNCATE|ALTER|CREATE|INSERT|UPDATE)\s+/i,
    // EXEC/EXECUTE with xp_ or sp_ (SQL Server stored procedures)
    /(EXEC|EXECUTE)\s+(xp_|sp_)/i,
    // WAITFOR DELAY / BENCHMARK (time-based blind SQLi)
    /WAITFOR\s+DELAY\s+'/i,
    /BENCHMARK\s*\(\s*\d+/i,
    // LOAD_FILE, INTO OUTFILE/DUMPFILE (file access)
    /(LOAD_FILE|INTO\s+(OUT|DUMP)FILE)/i,
    // Comment-based bypass after injection: '--  or /* */
    /('|"|`)\s*;\s*--/i,
    // Information schema probing
    /INFORMATION_SCHEMA\.(TABLES|COLUMNS|SCHEMATA)/i,
    // Hex-encoded attacks
    /0x[0-9a-f]{8,}/i,
    // CHAR() function used to bypass filters
    /CHAR\s*\(\s*\d+(\s*,\s*\d+){3,}\s*\)/i,
  ];

  // LOW CONFIDENCE: These may appear in legitimate input but are worth flagging.
  const lowConfidencePatterns = [
    // Single SQL keywords (could appear in legitimate text, e.g., "SELECT a plan")
    /(\b(DROP|ALTER|TRUNCATE)\s+(TABLE|DATABASE|INDEX)\b)/i,
    // Simple tautology without quotes
    /(\b1\s*=\s*1\b|\b0\s*=\s*0\b)/i,
    // xp_ or sp_ prefixes
    /\b(xp_|sp_)\w+/i,
  ];

  const body = JSON.stringify(req.body || {});
  const query = JSON.stringify(req.query || {});
  const params = JSON.stringify(req.params || {});
  const combined = body + query + params;

  // Skip very short inputs (can't be SQL injection)
  if (combined.length < 10) {
    return next();
  }

  // Check HIGH confidence patterns - BLOCK
  for (const pattern of highConfidencePatterns) {
    if (pattern.test(combined)) {
      logger.error(`[SECURITY] SQL injection BLOCKED: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        user_agent: req.get('user-agent'),
        pattern: pattern.toString(),
        user_id: (req as any).user?.id,
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'SQL_INJECTION_BLOCKED',
          message: 'Request blocked due to potentially malicious content.',
        },
      });
    }
  }

  // Check LOW confidence patterns - FLAG only
  for (const pattern of lowConfidencePatterns) {
    if (pattern.test(combined)) {
      logger.warn(`[SECURITY] SQL injection pattern flagged (low confidence): ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        user_agent: req.get('user-agent'),
        pattern: pattern.toString(),
      });

      (req as any).securityFlags = (req as any).securityFlags || [];
      (req as any).securityFlags.push('sql_injection_pattern_low');
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
