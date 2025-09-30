import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from '../metrics/prometheus.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly prometheusService: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const method = request.method;
    const endpoint = String(
      (request as any).route?.path || (request as any).url,
    );
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const status = response.statusCode.toString();

          this.prometheusService.incrementHttpRequests(
            String(method),
            String(status),
            String(endpoint),
          );
          this.prometheusService.recordHttpDuration(
            String(method),
            String(endpoint),
            Number(duration),
          );
        },
        error: (error: any) => {
          const duration = (Date.now() - startTime) / 1000;
          const status = String(error.status) || '500';

          this.prometheusService.incrementHttpRequests(
            String(method),
            String(status),
            String(endpoint),
          );
          this.prometheusService.recordHttpDuration(
            String(method),
            String(endpoint),
            Number(duration),
          );
        },
      }),
    );
  }
}
