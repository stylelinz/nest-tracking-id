import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { TrackingLoggerService } from './logger/logger.service';
import { Request, Response } from 'express';
import { TRACKING_ID_HEADER_NAME } from './logger/constants';

@Injectable()
export class End2EndLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: TrackingLoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    this.logger.http({
      message: 'request',
      ...this.getRequestPayload(request),
    });

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        response.on('close', () => {
          const delay = Date.now() - now;
          this.logger.http({
            message: 'response',
            status: response.statusCode,
            trackingId: response.getHeader(TRACKING_ID_HEADER_NAME),
            headers: response.getHeaders(),
            delay,
          });
        });
      }),
    );
  }

  private getRequestPayload(req: Request) {
    return {
      ip: req.ip,
      protocol: req.protocol,
      method: req.method,
      params: req.params,
      query: req.query,
      httpVersion: req.httpVersion,
      path: req.path,
      baseUrl: req.baseUrl,
      headers: req.headers,
      body: req.body,
    };
  }
}
