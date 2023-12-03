import { BadRequestException, Injectable } from '@nestjs/common';
import { TrackingLoggerService } from './logger/logger.service';
import { HELLO_MESSAGE, InjectFooClient } from './rmq/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: TrackingLoggerService,
    @InjectFooClient() private readonly fooClient: ClientProxy,
  ) {}

  getHello(): string {
    this.logger.log('sending hello to queue...');
    return 'Hello World!';
  }

  async sendMessage() {
    await firstValueFrom(this.fooClient.emit(HELLO_MESSAGE, 'i am here'));
  }

  getError() {
    throw new BadRequestException('U shall not pass');
  }
}
