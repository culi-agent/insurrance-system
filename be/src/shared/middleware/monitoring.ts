import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Application metrics collector
 */
class MetricsCollector {
  private requestCount = 0;
  private errorCount = 0;
  private responseTimeSamples: number[] = [];
  private statusCounts: Record<number, number> = {};
  private endpointCounts: Record<string, number> = {};
  private startTime = Date.now();

  recordRequest(method: string, path: string, statusCode: number, durationMs: number) {
    this.requestCount++;
    this.responseTimeSamples.push(durationMs);
    if (this.responseTimeSamples.length > 1000) this.responseTimeSamples.shift();

    this.statusCounts[statusCode] = (this.statusCounts[statusCode] || 0) + 1;
    if (statusCode >= 400) this.errorCount++;

    const endpoint = `${method} ${this.normalizePath(path)}`;
    this.endpointCounts[endpoint] = (this.endpointCounts[endpoint] || 0) + 1;
  }

  getMetrics() {
    const sorted = [...this.responseTimeSamples].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      uptime_seconds: Math.round((Date.now() - this.startTime) / 1000),
      total_requests: this.requestCount,
      total_errors: this.errorCount,
      error_rate: this.requestCount > 0 ? Math.round((this.errorCount / this.requestCount) * 10000) / 100 : 0,
      response_time: {
        avg: len > 0 ? Math.round(sorted.reduce((a, b) => a + b, 0) / len) : 0,
        p50: len > 0 ? Math.round(sorted[Math.floor(len * 0.5)]) : 0,
        p90: len > 0 ? Math.round(sorted[Math.floor(len * 0.9)]) : 0,
        p95: len > 0 ? Math.round(sorted[Math.floor(len * 0.95)]) : 0,
        p99: len > 0 ? Math.round(sorted[Math.floor(len * 0.99)]) : 0,
        max: len > 0 ? Math.round(sorted[len - 1]) : 0,
      },
      status_codes: this.statusCounts,
      top_endpoints: Object.entries(this.endpointCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([endpoint, count]) => ({ endpoint, count })),
      memory: {
        rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heap_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }

  getHealthCheck() {
    const mem = process.memoryUsage();
    const heapUsedPct = (mem.heapUsed / mem.heapTotal) * 100;

    return {
      status: heapUsedPct > 90 ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.round((Date.now() - this.startTime) / 1000),
      checks: {
        memory: heapUsedPct < 90 ? 'pass' : 'warn',
        error_rate: (this.errorCount / Math.max(this.requestCount, 1)) < 0.05 ? 'pass' : 'warn',
      },
    };
  }

  reset() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimeSamples = [];
    this.statusCounts = {};
    this.endpointCounts = {};
  }

  private normalizePath(path: string): string {
    // Replace UUIDs and numeric IDs with :id
    return path
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, ':id')
      .replace(/\/\d+/g, '/:id')
      .split('?')[0]; // Remove query params
  }
}

export const metrics = new MetricsCollector();

/**
 * Metrics collection middleware
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    metrics.recordRequest(req.method, req.originalUrl, res.statusCode, durationMs);
  });

  next();
}

/**
 * Alerting thresholds checker
 */
export class AlertingService {
  private alerts: Array<{ type: string; message: string; timestamp: string; severity: 'info' | 'warning' | 'critical' }> = [];

  checkThresholds() {
    const m = metrics.getMetrics();

    // High error rate alert
    if (m.error_rate > 5) {
      this.addAlert('critical', 'high_error_rate', `Error rate ${m.error_rate}% exceeds 5% threshold`);
    }

    // Slow response time alert
    if (m.response_time.p95 > 500) {
      this.addAlert('warning', 'slow_response', `P95 response time ${m.response_time.p95}ms exceeds 500ms`);
    }

    // Memory alert
    if (m.memory.heap_used_mb > 450) {
      this.addAlert('warning', 'high_memory', `Heap usage ${m.memory.heap_used_mb}MB approaching limit`);
    }
  }

  getAlerts(limit: number = 50) {
    return this.alerts.slice(-limit);
  }

  clearAlerts() {
    this.alerts = [];
  }

  private addAlert(severity: 'info' | 'warning' | 'critical', type: string, message: string) {
    // Dedup: don't add same alert within 5 minutes
    const recent = this.alerts.filter(a => a.type === type && Date.now() - new Date(a.timestamp).getTime() < 300000);
    if (recent.length > 0) return;

    this.alerts.push({ type, message, timestamp: new Date().toISOString(), severity });
    if (severity === 'critical') {
      logger.error(`[ALERT] ${message}`);
    } else {
      logger.warn(`[ALERT] ${message}`);
    }

    // Keep max 200 alerts
    if (this.alerts.length > 200) this.alerts = this.alerts.slice(-100);
  }
}

export const alerting = new AlertingService();
