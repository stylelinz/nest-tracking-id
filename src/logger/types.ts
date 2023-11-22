import { LogLevel } from '@nestjs/common';

export type LogData = {
  sourceClass?: string; // Classname of the source
  trackingId?: string; // Correlation ID
  error?: Error; // Error object
  props?: NodeJS.Dict<any>; // Additional custom properties
};

export type Log = {
  timestamp: number; // Unix timestamp
  level: LogLevel; // Log level
  message: string; // Log message
  data: LogData; // Log data
};
