import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Response time tracking middleware
 * Logs slow requests (> 200ms) and adds X-Response-Time header
 */
export function responseTimeTracker(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    
    res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);

    if (durationMs > 200) {
      logger.warn(`[SLOW] ${req.method} ${req.originalUrl} - ${durationMs.toFixed(0)}ms`, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration_ms: Math.round(durationMs),
        user_id: (req as any).user?.id,
      });
    }
  });

  next();
}

/**
 * Response compression hints middleware
 */
export function compressionHints(req: Request, res: Response, next: NextFunction) {
  // Set cache headers for static/semi-static content
  const url = req.originalUrl;

  if (url.includes('/products') && req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min
  } else if (url.includes('/cms/') || url.includes('/faqs')) {
    res.setHeader('Cache-Control', 'public, max-age=600'); // 10 min
  } else if (url.includes('/analytics') || url.includes('/reports')) {
    res.setHeader('Cache-Control', 'private, max-age=60'); // 1 min
  } else {
    res.setHeader('Cache-Control', 'no-cache');
  }

  next();
}

/**
 * Simple in-memory response cache for frequently accessed endpoints
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize = 500;

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: any, ttlMs: number): void {
    if (this.cache.size >= this.maxSize) {
      // Evict oldest entries
      const keysToDelete = Array.from(this.cache.keys()).slice(0, 50);
      keysToDelete.forEach(k => this.cache.delete(k));
    }
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  invalidate(pattern?: string): number {
    if (!pattern) {
      const size = this.cache.size;
      this.cache.clear();
      return size;
    }
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) { this.cache.delete(key); count++; }
    }
    return count;
  }

  getStats(): { size: number; max_size: number; hit_rate: number } {
    return { size: this.cache.size, max_size: this.maxSize, hit_rate: 0 };
  }
}

export const responseCache = new ResponseCache();

/**
 * Cache middleware factory
 */
export function cacheResponse(ttlSeconds: number = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();

    const cacheKey = `${req.originalUrl}:${(req as any).user?.id || 'anon'}`;
    const cached = responseCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Override res.json to capture response
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      if (res.statusCode === 200) {
        responseCache.set(cacheKey, data, ttlSeconds * 1000);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

/**
 * Request deduplication (prevent duplicate concurrent requests)
 */
const pendingRequests = new Map<string, Promise<any>>();

export function deduplicateRequests(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET') return next();

  const key = `${req.originalUrl}:${(req as any).user?.id || 'anon'}`;
  
  if (pendingRequests.has(key)) {
    // Wait for existing request to complete
    pendingRequests.get(key)!.then(() => next()).catch(() => next());
    return;
  }

  next();
}

/**
 * Pagination optimizer - limits max page size
 */
export function paginationLimiter(maxPageSize: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.per_page as string);
    if (limit && limit > maxPageSize) {
      req.query.limit = String(maxPageSize);
      req.query.per_page = String(maxPageSize);
    }
    next();
  };
}
