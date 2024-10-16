import { Inject, Injectable } from '@nestjs/common';
import { DailyStatisticRepository } from './repositories/daily-statistic.repository';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class StatisticService {
  constructor(
    private readonly dailyStatisticRepository: DailyStatisticRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async isExistingDailyRecord(
    day: number,
    month: number,
    year: number,
  ): Promise<boolean> {
    const dailyRecord = await this.dailyStatisticRepository.findOne({
      createdAt: new Date(year, month, day),
    });

    if (!dailyRecord) {
      return false;
    }

    return true;
  }

  async createdUser() {
    //check daily record is existing or not
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    const isExitingRecord = await this.isExistingDailyRecord(day, month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.dailyStatisticRepository.create({
        newUsers: 1,
        createdAt: new Date(year, month, day),
      });

      return;
    }

    //if existing, update record
    await this.dailyStatisticRepository.updateOne(
      { createdAt: new Date(year, month, day) },
      {
        $inc: { newUsers: 1 },
      },
    );

    //update statistic record in redis
    const statisticRecord = await this.cacheManager.get('user_feed_statistic');

    statisticRecord['user'] += 1;

    console.log(statisticRecord);

    this.cacheManager.set('user_feed_statistic', statisticRecord, { ttl: 0 });
  }

  async deletedUser() {
    //check daily record is existing or not
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    const isExitingRecord = await this.isExistingDailyRecord(day, month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.dailyStatisticRepository.create({
        deletedUsers: 1,
        createdAt: new Date(year, month, day),
      });

      return;
    }

    //if existing, update record
    await this.dailyStatisticRepository.updateOne(
      { createdAt: new Date(year, month, day) },
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

    const isExitingRecord = await this.isExistingDailyRecord(day, month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.dailyStatisticRepository.create({
        newFeeds: 1,
        createdAt: new Date(year, month, day),
      });

      return;
    }

    //if existing, update record
    await this.dailyStatisticRepository.updateOne(
      { createdAt: new Date(year, month, day) },
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

    const isExitingRecord = await this.isExistingDailyRecord(day, month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.dailyStatisticRepository.create({
        createdAt: new Date(year, month, day),
        newFriends: 1,
      });

      return;
    }

    //if existing, update record
    await this.dailyStatisticRepository.updateOne(
      { createdAt: new Date(year, month, day) },
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

    const isExitingRecord = await this.isExistingDailyRecord(day, month, year);

    //if not create new
    if (!isExitingRecord) {
      await this.dailyStatisticRepository.create({
        createdAt: new Date(year, month, day),
        deletedFriends: 1,
      });

      return;
    }

    //if existing, update record
    await this.dailyStatisticRepository.updateOne(
      { createdAt: new Date(year, month, day) },
      {
        $inc: { deletedFriends: 1 },
      },
    );
  }

  async country(country: string) {
    //get country redis
    const countryRecord = await this.cacheManager.get('country_statistic');

    console.log({ content: countryRecord, type: typeof countryRecord });
    // countryRecord = JSON.parse(countryRecord);

    console.log({ country, countryRecord });
    //check country is exiting or not
    if (!countryRecord[country]) {
      countryRecord[country] = 1;
    } else {
      countryRecord[country] += 1;
    }
    console.log(countryRecord);

    //save again to redis
    this.cacheManager.set('country_statistic', countryRecord, {
      ttl: 0,
    });
  }

  async changeCountry(oldCountry, newCountry) {
    //get country redis
    const countryRecord = await this.cacheManager.get('country_statistic');

    //update old country
    countryRecord[oldCountry] -= 1;

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
    const reportRecord = await this.cacheManager.get('report_statistic');

    //check country is exiting or not
    if (type === 'user') {
      reportRecord['user'] += 1;
    } else {
      reportRecord['feed'] += 1;
    }

    this.cacheManager.set('report_statistic', reportRecord, {
      ttl: 0,
    });
  }

  async getStatisticInfor() {
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    console.log({ day, month, year });

    //get number of users, number of feeds
    const userFeedStatistic = await this.cacheManager.get(
      'user_feed_statistic',
    );

    //get number of user, feed reports
    const reportStatistic = await this.cacheManager.get('report_statistic');

    //get number of user of each country
    const countryStatistic = await this.cacheManager.get('country_statistic');

    //get 7 last day new user, new feed, new friend
    const sevenLastDaysRecord = await this.dailyStatisticRepository.find({
      createdAt: {
        $gte: new Date(year, month, day - 7),
        $lte: new Date(year, month, day),
      },
    });

    const statistic = {
      numberOfTotalUsers: userFeedStatistic['user'],
      numberOfTotalFeeds: userFeedStatistic['feed'],
      numberOfUserReports: reportStatistic['user'],
      numberOfFeedReports: reportStatistic['feed'],
      sevenLastDaysRecords: sevenLastDaysRecord,
      countryStatistic: countryStatistic,
    };

    return statistic;
  }
}
