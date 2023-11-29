import { Global, Module } from '@nestjs/common';
import { TrackingLoggerService } from './logger.service';
import { ClsModule } from 'nestjs-cls';
import { randomUUID } from 'node:crypto';
import { Response } from 'express';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      interceptor: {
        mount: true,
        generateId: true,
        idGenerator(context) {
          const res = context.switchToHttp().getResponse<Response>();
          const uuid = randomUUID();
          res.setHeader('x-tracking-id', uuid);
          return uuid;
        },
      },
    }),
  ],
  providers: [TrackingLoggerService],
  exports: [TrackingLoggerService],
})
export class LoggerModule {}
