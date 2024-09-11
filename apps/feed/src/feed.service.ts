import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedService {
  getHello(): string {
    return 'Hello World!';
  }
}
