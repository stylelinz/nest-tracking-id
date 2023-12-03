import { Inject, Injectable, LoggerService, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import winston from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class TrackingLoggerService implements LoggerService {
  private logger: winston.Logger;
  constructor(
    private readonly clsService: ClsService,
    @Inject(INQUIRER) private readonly parentClass: object,
  ) {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.prettyPrint({ colorize: true }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: string) {
    this.logger.log('info', message, this.getContextMetaData());
  }

  error(error: Error) {
    this.logger.error({ ...error, ...this.getContextMetaData() });
  }

  warn(message: string) {
    this.logger.warn(message, this.getContextMetaData());
  }

  http(payload: Omit<winston.LogEntry, 'level'>) {
    this.logger.log({
      level: 'info',
      message: payload?.message ?? 'http log',
      ...this.getContextMetaData(),
      ...payload,
    });
  }

  private getContextMetaData() {
    return {
      trackingId: this.clsService.getId(),
      className: this.parentClass.constructor.name,
    };
  }

  getTrackingId() {
    return this.clsService.getId();
  }
}
