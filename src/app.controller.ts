import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { HELLO_MESSAGE } from './rmq/constants';
import { ConfirmChannel, Message } from 'amqplib';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('eeerrr')
  getErr() {
    return this.appService.getError();
  }

  @Post('msg')
  async sendMessage(@Body() body: any) {
    return await this.appService.sendMessage(body);
  }

  @EventPattern(HELLO_MESSAGE)
  async logHello(@Payload() data: any, @Ctx() context: RmqContext) {
    const message = context.getMessage() as Message;
    const channel = context.getChannelRef() as ConfirmChannel;

    console.log(data);
    channel.ack(message);
  }
}
