import { Injectable, NestMiddleware } from '@nestjs/common';
import { TrackingLoggerService } from './logger/logger.service';
import { Request, Response } from 'express';
import { TRACKING_ID_HEADER_NAME } from './logger/constants';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  constructor(private readonly logger: TrackingLoggerService) {}
  use(req: Request, res: Response, next: () => void) {
    const now = Date.now();

    this.logger.http({ message: 'request', ...this.getRequestPayload(req) });

    next();

    res.on('close', () => {
      const delay = Date.now() - now;
      this.logger.http({
        message: 'response',
        status: res.statusCode,
        trackingId: res.getHeader(TRACKING_ID_HEADER_NAME),
        headers: res.getHeaders(),
        delay,
      });
    });
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
