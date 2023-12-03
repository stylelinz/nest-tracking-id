import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggerInterceptor } from './http-logger.interceptor';
import { ClsInterceptor, ClsModule } from 'nestjs-cls';
import { randomUUID } from 'node:crypto';
import { Response } from 'express';
import { TRACKING_ID_HEADER_NAME } from './logger/constants';
import { HttpFilter } from './http.filter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FOO_CLIENT_NAME, FOO_QUEUE } from './rmq/constants';
import { AmqplibQueueOptions } from '@nestjs/microservices/external/rmq-url.interface';
import { RmqContextInterceptor } from './rmq/rmq-context.interceptor';

@Module({
  imports: [
    LoggerModule,
    ClsModule.forRoot({
      global: true,
      interceptor: {
        mount: false,
        generateId: true,
        idGenerator(context) {
          const uuid = randomUUID();
          switch (context.getType()) {
            case 'http':
              const res = context.switchToHttp().getResponse<Response>();
              res.setHeader(TRACKING_ID_HEADER_NAME, uuid);
              break
            case 'rpc':
              const payload = context.switchToRpc().getData();
              if (typeof payload.trackingId === 'string')
                return payload.trackingId;
              break
            case 'ws':
              break
          }
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
    { provide: APP_INTERCEPTOR, useClass: HttpLoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: RmqContextInterceptor },
    { provide: APP_FILTER, useClass: HttpFilter },
    AppService,
  ],
})
export class AppModule {}
