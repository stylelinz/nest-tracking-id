import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TrackingLoggerService } from '../logger/logger.service';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class RmqContextInterceptor implements NestInterceptor {
  constructor(private readonly logger: TrackingLoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'rpc') {
      const rmqCtx = context.switchToRpc().getContext<RmqContext>();
      const payload = context.switchToRpc().getData();
      const message = rmqCtx.getMessage();
      const pattern = rmqCtx.getPattern();
      this.logger.http({
        payload,
        message,
        pattern,
      });
    }
    return next.handle();
  }
}
