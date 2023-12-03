import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { FOO_QUEUE } from './rmq/constants';
import { AmqplibQueueOptions } from '@nestjs/microservices/external/rmq-url.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: FOO_QUEUE,
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: false,
      } as AmqplibQueueOptions,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
