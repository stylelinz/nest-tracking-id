import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

@Catch()
@Injectable()
export class HttpFilter extends BaseExceptionFilter implements ExceptionFilter {
  constructor() {
    super();
  }
  catch(exception: unknown, host: ArgumentsHost) {
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
