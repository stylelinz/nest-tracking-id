import { Injectable } from '@nestjs/common';
import { TrackingLoggerService } from './logger/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: TrackingLoggerService) {}

  getHello(): string {
    this.logger.log('sending hello to queue...');
    return 'Hello World!';
  }

  getWarning() {
    this.logger.warn('WARNING');
    return 'Weird';
  }
}
