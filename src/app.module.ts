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
import { HttpFilter } from './http.filter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FOO_CLIENT_NAME, FOO_QUEUE } from './rmq/constants';
import { AmqplibQueueOptions } from '@nestjs/microservices/external/rmq-url.interface';

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
    ClientsModule.register([
      {
        name: FOO_CLIENT_NAME,
        transport: Transport.RMQ,
        options: {
          queue: FOO_QUEUE,
          persistent: false,
          urls: ['amqp://guest:guest@localhost:5672'],
          queueOptions: {
            durable: false,
          } as AmqplibQueueOptions,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: End2EndLoggerInterceptor },
    { provide: APP_FILTER, useClass: HttpFilter },
    AppService,
  ],
})
export class AppModule {}
