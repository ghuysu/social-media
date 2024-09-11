import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportingService {
  getHello(): string {
    return 'Hello World!';
  }
}
