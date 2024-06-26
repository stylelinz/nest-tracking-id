import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TrackingLoggerService } from '../logger/logger.service';
import { RmqContext } from '@nestjs/microservices';
import { Message } from 'amqplib';

@Injectable()
export class RmqContextInterceptor implements NestInterceptor {
  constructor(private readonly logger: TrackingLoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'rpc') {
      const rmqCtx = context.switchToRpc().getContext<RmqContext>();
      const payload = context.switchToRpc().getData();
      const { fields, properties } = rmqCtx.getMessage() as Message;
      const pattern = rmqCtx.getPattern();
      this.logger.http({
        message: 'Incoming RMQ message',
        payload,
        fields,
        properties,
        pattern,
      });
    }
    return next.handle();
  }
}
