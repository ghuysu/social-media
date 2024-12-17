import { Inject, Injectable } from '@nestjs/common';
import { StatisticRepository } from './repositories/statistic.repository';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class StatisticService {
  constructor(
    private readonly statisticRepository: StatisticRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async isExistingDailyRecord(month: number, year: number): Promise<boolean> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const monthlyRecord = await this.statisticRepository.findOne({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    return !!monthlyRecord;
  }

  async createdUser() {
    //check daily record is existing or not
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const isExitingRecord = await this.isExistingDailyRecord(month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.statisticRepository.create({
        newUsers: 1,
        createdAt: new Date(year, month, day),
      });

      return;
    }

    //if existing, update record
    await this.statisticRepository.updateOne(
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        $inc: { newUsers: 1 },
      },
    );

    //update statistic record in redis
    const statisticRecord = await this.cacheManager.get('user_feed_statistic');

    statisticRecord['user'] += 1;

    this.cacheManager.set('user_feed_statistic', statisticRecord, { ttl: 0 });
  }

  async deletedUser() {
    //check daily record is existing or not
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const isExitingRecord = await this.isExistingDailyRecord(month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.statisticRepository.create({
        deletedUsers: 1,
        createdAt: new Date(year, month, day),
      });

      return;
    }

    //if existing, update record
    await this.statisticRepository.updateOne(
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        $inc: { deletedUsers: 1 },
      },
    );

    //update statistic record in redis
    const statisticRecord = await this.cacheManager.get('user_feed_statistic');

    statisticRecord['user'] -= 1;

    this.cacheManager.set('user_feed_statistic', statisticRecord, { ttl: 0 });
  }

  async createdFeed() {
    //check daily record is existing or not
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const isExitingRecord = await this.isExistingDailyRecord(month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.statisticRepository.create({
        newFeeds: 1,
        createdAt: new Date(year, month, day),
      });

      return;
    }

    //if existing, update record
    await this.statisticRepository.updateOne(
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        $inc: { newFeeds: 1 },
      },
    );

    //update statistic record in redis
    const statisticRecord = await this.cacheManager.get('user_feed_statistic');

    statisticRecord['feed'] += 1;

    this.cacheManager.set('user_feed_statistic', statisticRecord, { ttl: 0 });
  }

  async deletedFeed(num: number) {
    //update statistic record in redis
    const statisticRecord = await this.cacheManager.get('user_feed_statistic');

    if (!num) {
      statisticRecord['feed'] -= 1;
    } else {
      statisticRecord['feed'] -= num;
    }
    this.cacheManager.set('user_feed_statistic', statisticRecord, { ttl: 0 });
  }

  async beFriend() {
    //check daily record is existing or not
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const isExitingRecord = await this.isExistingDailyRecord(month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.statisticRepository.create({
        createdAt: new Date(year, month, day),
        newFriends: 1,
      });

      return;
    }

    //if existing, update record
    await this.statisticRepository.updateOne(
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        $inc: { newFriends: 1 },
      },
    );
  }

  async removedFriend() {
    //check daily record is existing or not
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const isExitingRecord = await this.isExistingDailyRecord(month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.statisticRepository.create({
        createdAt: new Date(year, month, day),
        deletedFriends: 1,
      });

      return;
    }

    //if existing, update record
    await this.statisticRepository.updateOne(
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        $inc: { deletedFriends: 1 },
      },
    );
  }

  async country(country: string) {
    //get country redis
    const countryRecord = await this.cacheManager.get('country_statistic');

    //check country is exiting or not
    if (!countryRecord[country]) {
      countryRecord[country] = 1;
    } else {
      countryRecord[country] += 1;
    }

    //save again to redis
    this.cacheManager.set('country_statistic', countryRecord, {
      ttl: 0,
    });
  }

  async changeCountry(oldCountry: string, newCountry: string) {
    //get country redis
    const countryRecord = await this.cacheManager.get('country_statistic');

    //update old country
    if (oldCountry) countryRecord[oldCountry] -= 1;

    //check new country is exiting or not
    if (!countryRecord[newCountry]) {
      countryRecord[newCountry] = 1;
    } else {
      countryRecord[newCountry] += 1;
    }

    //save again to redis
    await this.cacheManager.set('country_statistic', countryRecord, { ttl: 0 });
  }

  async newReport(type: string) {
    //get country redis
    const reportRecord = await this.cacheManager.get('report_statistics');

    //check country is exiting or not
    if (type === 'user') {
      reportRecord['user'] += 1;
    } else {
      reportRecord['feed'] += 1;
    }

    this.cacheManager.set('report_statistics', reportRecord, {
      ttl: 0,
    });
  }

  async processedReport(type: string, number: number) {
    //get country redis
    const reportRecord = await this.cacheManager.get('report_statistics');

    //check country is exiting or not
    if (type === 'user') {
      reportRecord['user'] -= number;
    } else {
      reportRecord['feed'] -= number;
    }

    this.cacheManager.set('report_statistics', reportRecord, {
      ttl: 0,
    });
  }

  async getStatisticInfor() {
    //get number of users, number of feeds
    const userFeedStatistic = await this.cacheManager.get(
      'user_feed_statistic',
    );

    //get number of user, feed reports
    const reportStatistic = await this.cacheManager.get('report_statistics');

    //get number of user of each country
    const countryStatistic = await this.cacheManager.get('country_statistic');

    //get 7 last day new user, new feed, new friend
    const monthlyRecords = await this.statisticRepository.findAll();

    const statistic = {
      numberOfTotalUsers: userFeedStatistic['user'],
      numberOfTotalFeeds: userFeedStatistic['feed'],
      numberOfUserReports: reportStatistic['user'],
      numberOfFeedReports: reportStatistic['feed'],
      countryStatistic: countryStatistic,
      monthlyRecords: monthlyRecords,
    };

    return statistic;
  }
}
