import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AppService {
  constructor(private readonly clsService: ClsService) {}
  getHello(): string {
    const trackingId = this.clsService.getId();
    return 'Hello World!' + trackingId;
  }
}
