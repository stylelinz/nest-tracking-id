import { Global, Module } from '@nestjs/common';
import { TrackingLoggerService } from './logger.service';

@Global()
@Module({
  providers: [TrackingLoggerService],
  exports: [TrackingLoggerService],
})
export class LoggerModule {}
