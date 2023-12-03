import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TrackingLoggerService } from './logger/logger.service';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

@Catch()
@Injectable()
export class HttpFilter extends BaseExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: TrackingLoggerService) {
    super();
  }
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof Error) {
      this.logger.error(exception);
    }

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const resBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: String(exception) };
    const res = host.switchToHttp().getResponse<Response>();
    res.status(httpStatus).json(resBody);
  }
}
