/**
 * Simple in-memory cache middleware
 * Sprint 6: S6-06 - Performance optimization
 * In production: Replace with Redis-based cache
 */
import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  expires_at: number;
}

const memoryCache = new Map<string, CacheEntry>();

// Clean expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expires_at < now) {
      memoryCache.delete(key);
    }
  }
}, 60000); // Clean every 60 seconds

/**
 * Cache middleware for GET requests
 * @param ttlSeconds Cache duration in seconds
 */
export function cacheResponse(ttlSeconds: number = 300) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = `${req.originalUrl}`;
    const cached = memoryCache.get(cacheKey);

    if (cached && cached.expires_at > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached.data);
      return;
    }

    // Override res.json to capture response
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, {
          data,
          expires_at: Date.now() + ttlSeconds * 1000,
        });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return {
    entries: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
}
