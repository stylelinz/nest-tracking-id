import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClsModule } from 'nestjs-cls';
import { randomUUID } from 'crypto';
import { Response } from 'express';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      interceptor: {
        mount: true,
        setup(cls, context) {
          const res = context.switchToHttp().getResponse<Response>();
          const uuid = randomUUID();
          cls.set('user-id', uuid);
          res.setHeader('x-tracking-id', uuid);
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
