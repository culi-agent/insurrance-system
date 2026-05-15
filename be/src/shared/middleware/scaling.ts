import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Database connection pool monitor
 */
class ConnectionPoolMonitor {
  private activeConnections = 0;
  private maxConnections: number;
  private waitingQueue: number = 0;

  constructor(maxConnections: number = 20) {
    this.maxConnections = maxConnections;
  }

  acquire() { this.activeConnections++; }
  release() { this.activeConnections = Math.max(0, this.activeConnections - 1); }
  getStatus() {
    return {
      active: this.activeConnections,
      max: this.maxConnections,
      utilization: Math.round((this.activeConnections / this.maxConnections) * 100),
      waiting: this.waitingQueue,
      healthy: this.activeConnections < this.maxConnections * 0.8,
    };
  }
}

export const dbPoolMonitor = new ConnectionPoolMonitor();

/**
 * Circuit breaker pattern for external service calls
 */
export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly threshold: number;
  private readonly timeout: number;
  private readonly halfOpenMax: number;

  constructor(
    private name: string,
    threshold: number = 5,
    timeout: number = 30000,
    halfOpenMax: number = 3
  ) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.halfOpenMax = halfOpenMax;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error(`Circuit breaker [${this.name}] is OPEN. Service unavailable.`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.halfOpenMax) {
        this.state = 'closed';
        logger.info(`[CircuitBreaker] ${this.name}: CLOSED (recovered)`);
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      logger.warn(`[CircuitBreaker] ${this.name}: OPEN (threshold reached: ${this.failureCount})`);
    }
  }

  getState() {
    return { name: this.name, state: this.state, failures: this.failureCount, last_failure: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null };
  }
}

// Pre-configured circuit breakers for external services
export const circuitBreakers = {
  paymentGateway: new CircuitBreaker('payment-gateway', 3, 60000),
  insurerApi: new CircuitBreaker('insurer-api', 5, 30000),
  emailService: new CircuitBreaker('email-service', 5, 30000),
  smsService: new CircuitBreaker('sms-service', 5, 30000),
};

/**
 * Request queue for handling bursts
 */
class RequestQueue {
  private queue: Array<{ resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = [];
  private processing = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 100) {
    this.maxConcurrent = maxConcurrent;
  }

  async enqueue<T>(fn: () => Promise<T>, timeoutMs: number = 30000): Promise<T> {
    if (this.processing < this.maxConcurrent) {
      this.processing++;
      try {
        return await fn();
      } finally {
        this.processing--;
        this.processNext();
      }
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request queue timeout'));
      }, timeoutMs);
      this.queue.push({ resolve: () => { clearTimeout(timeout); resolve(fn()); }, reject, timeout });
    });
  }

  private processNext() {
    if (this.queue.length > 0 && this.processing < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        this.processing++;
        next.resolve();
      }
    }
  }

  getStatus() {
    return { processing: this.processing, queued: this.queue.length, max_concurrent: this.maxConcurrent };
  }
}

export const requestQueue = new RequestQueue();

/**
 * Graceful shutdown handler
 */
export function setupGracefulShutdown(server: any, cleanup?: () => Promise<void>) {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      logger.info('[Shutdown] Server closed. Running cleanup...');
      if (cleanup) await cleanup();
      logger.info('[Shutdown] Cleanup complete. Exiting.');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('[Shutdown] Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Health check middleware with dependency checks
 */
export function healthCheckMiddleware(dependencies: Record<string, () => Promise<boolean>>) {
  return async (req: Request, res: Response) => {
    const checks: Record<string, { status: string; latency_ms: number }> = {};
    let allHealthy = true;

    for (const [name, checkFn] of Object.entries(dependencies)) {
      const start = Date.now();
      try {
        const healthy = await checkFn();
        checks[name] = { status: healthy ? 'healthy' : 'unhealthy', latency_ms: Date.now() - start };
        if (!healthy) allHealthy = false;
      } catch (error) {
        checks[name] = { status: 'error', latency_ms: Date.now() - start };
        allHealthy = false;
      }
    }

    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.round(process.uptime()),
      checks,
      circuit_breakers: Object.values(circuitBreakers).map(cb => cb.getState()),
      db_pool: dbPoolMonitor.getStatus(),
      request_queue: requestQueue.getStatus(),
    });
  };
}

/**
 * Database read replica routing (concept)
 */
export function readReplicaRouter(req: Request, res: Response, next: NextFunction) {
  // In production, route read-only queries to read replicas
  if (req.method === 'GET') {
    (req as any).dbConnection = 'read_replica';
  } else {
    (req as any).dbConnection = 'primary';
  }
  next();
}
