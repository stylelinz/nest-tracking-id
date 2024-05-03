import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsInterceptor, ClsMiddleware } from 'nestjs-cls';
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
