import { Injectable } from '@nestjs/common';
import {
  register,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly activeConnections: Gauge<string>;
  private readonly authOperations: Counter<string>;
  private readonly redisConnections: Gauge<string>;
  private readonly dbConnections: Gauge<string>;

  constructor() {
    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register });

    // HTTP request metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'status', 'endpoint'],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'endpoint'],
      registers: [register],
    });

    // Auth-specific metrics
    this.authOperations = new Counter({
      name: 'auth_operations_total',
      help: 'Total number of authentication operations',
      labelNames: ['operation', 'status'],
      registers: [register],
    });

    // Connection metrics
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      labelNames: ['type'],
      registers: [register],
    });

    this.redisConnections = new Gauge({
      name: 'redis_connections',
      help: 'Redis connection pool status',
      registers: [register],
    });

    this.dbConnections = new Gauge({
      name: 'database_connections',
      help: 'Database connection pool status',
      registers: [register],
    });
  }

  // Increment HTTP request counter
  incrementHttpRequests(method: string, status: string, endpoint: string) {
    this.httpRequestsTotal.inc({ method, status, endpoint });
  }

  // Record HTTP request duration
  recordHttpDuration(method: string, endpoint: string, duration: number) {
    this.httpRequestDuration.observe({ method, endpoint }, duration);
  }

  // Record auth operations
  recordAuthOperation(operation: string, status: string) {
    this.authOperations.inc({ operation, status });
  }

  // Update connection gauges
  setActiveConnections(type: string, count: number) {
    this.activeConnections.set({ type }, count);
  }

  setRedisConnections(count: number) {
    this.redisConnections.set(count);
  }

  setDatabaseConnections(count: number) {
    this.dbConnections.set(count);
  }

  // Get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Clear all metrics
  clearMetrics() {
    register.clear();
  }
}
