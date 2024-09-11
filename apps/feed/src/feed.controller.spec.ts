import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

describe('FeedController', () => {
  let feedController: FeedController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [FeedService],
    }).compile();

    feedController = app.get<FeedController>(FeedController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(feedController.getHello()).toBe('Hello World!');
    });
  });
});
