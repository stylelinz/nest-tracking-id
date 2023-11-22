import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClsModule } from 'nestjs-cls';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
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
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
