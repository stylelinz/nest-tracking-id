import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CLS_ID, ClsInterceptor, ClsMiddleware, ClsModule } from 'nestjs-cls';
import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import { TRACKING_ID_HEADER_NAME } from './logger/constants';
import { HttpFilter } from './http.filter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FOO_CLIENT_NAME, FOO_QUEUE } from './rmq/constants';
import { AmqplibQueueOptions } from '@nestjs/microservices/external/rmq-url.interface';
import { RmqContextInterceptor } from './rmq/rmq-context.interceptor';
import type { NestModule } from '@nestjs/common/interfaces';
import { AppMiddleware } from './app.middleware';

@Module({
  imports: [
    LoggerModule,
    ClsModule.forRoot({
      global: true,
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
    { provide: APP_INTERCEPTOR, useClass: RmqContextInterceptor },
    { provide: APP_FILTER, useClass: HttpFilter },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware, AppMiddleware).forRoutes('*');
  }
}
