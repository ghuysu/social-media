import { Controller, Get } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getHello(): string {
    return this.feedService.getHello();
  }
}
