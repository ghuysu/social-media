import { Controller, HttpStatus } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ChangeCountryDto } from './dto/changeCountry.dto';
import { NewReportDto } from './dto/new-report.dto';

@Controller()
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @EventPattern('created_user')
  async createdUser() {
    //user
    this.statisticService.createdUser();
    console.log('user');
  }

  @EventPattern('deleted_user')
  async deletedUser() {
    this.statisticService.deletedUser();
  }

  //country
  @EventPattern('country')
  async country(@Payload('country') country: string) {
    this.statisticService.country(country);
    console.log('country');
  }

  @EventPattern('change_country')
  async changeCountry(@Payload() { oldCountry, newCountry }: ChangeCountryDto) {
    this.statisticService.changeCountry(oldCountry, newCountry);
  }

  //feed
  @EventPattern('created_feed')
  async createdFeed() {
    this.statisticService.createdFeed();
  }

  @EventPattern('deleted_feed')
  async deletedFeed(@Payload('number') num: number) {
    this.statisticService.deletedFeed(num);
  }

  //friend
  @EventPattern('be_friend')
  async beFriend() {
    this.statisticService.beFriend();
  }

  @EventPattern('removed_friend')
  async removedFriend() {
    this.statisticService.removedFriend();
  }

  //report
  @EventPattern('new_report')
  async newReport(@Payload() { type }: NewReportDto) {
    this.statisticService.newReport(type);
  }

  @MessagePattern('get_statistic_infor')
  async getStatisticInfor() {
    const statistic = await this.statisticService.getStatisticInfor();
    return {
      status: HttpStatus.OK,
      message: 'Get statistic information successfully.',
      metadata: statistic,
    };
  }
}
