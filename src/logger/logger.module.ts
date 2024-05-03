import { Module } from '@nestjs/common';
import { TrackingLoggerService } from './logger.service';
import { CLS_ID, ClsModule } from 'nestjs-cls';
import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import { TRACKING_ID_HEADER_NAME } from './constants';

@Module({
  imports: [
    ClsModule.forRoot({
      global: false,
      interceptor: {
        mount: false,
        generateId: true,
        idGenerator(context) {
          if (context.getType() === 'rpc') {
            const payload = context.switchToRpc().getData();
            if (typeof payload.trackingId === 'string')
              return payload.trackingId;
          }
        },
      },
      middleware: {
        mount: false,
        setup: (cls, _req: Request, res: Response) => {
          const trackingId = randomUUID();
          res.setHeader(TRACKING_ID_HEADER_NAME, trackingId);
          cls.setIfUndefined<any>(CLS_ID, trackingId);
        },
      },
    }),
  ],
  providers: [TrackingLoggerService],
  exports: [TrackingLoggerService, ClsModule],
})
export class LoggerModule {}
