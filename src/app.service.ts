import { BadRequestException, Injectable } from '@nestjs/common';
import { TrackingLoggerService } from './logger/logger.service';
import { HELLO_MESSAGE, InjectFooClient } from './rmq/constants';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: TrackingLoggerService,
    @InjectFooClient() private readonly fooClient: ClientProxy,
  ) {}

  getHello(): string {
    this.logger.log('sending hello ...');
    return 'Hello World!';
  }

  async sendMessage(body: any) {
    this.logger.log(`sending message (${body.message}) to queue...`);
    const record = new RmqRecordBuilder(body)
      .setOptions({ messageId: this.logger.getTrackingId() })
      .build();
    await firstValueFrom(this.fooClient.emit(HELLO_MESSAGE, record));
  }

  getError() {
    this.logger.warn('Dont`t go any further');
    throw new BadRequestException('U shall not pass');
  }
}
