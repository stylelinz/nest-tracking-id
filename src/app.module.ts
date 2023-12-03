import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { End2EndLoggerInterceptor } from './end2end-logger.interceptor';
import { ClsInterceptor, ClsModule } from 'nestjs-cls';
import { randomUUID } from 'node:crypto';
import { Response } from 'express';
import { TRACKING_ID_HEADER_NAME } from './logger/constants';
import { AppFilter } from './app.filter';

@Module({
  imports: [
    LoggerModule,
    ClsModule.forRoot({
      global: true,
      interceptor: {
        mount: false,
        generateId: true,
        idGenerator(context) {
          const res = context.switchToHttp().getResponse<Response>();
          const uuid = randomUUID();
          res.setHeader(TRACKING_ID_HEADER_NAME, uuid);
          return uuid;
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: End2EndLoggerInterceptor },
    { provide: APP_FILTER, useClass: AppFilter },
    AppService,
  ],
})
export class AppModule {}
