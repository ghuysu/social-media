import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';

@Module({
  imports: [],
  controllers: [ReportingController],
  providers: [ReportingService],
})
export class ReportingModule {}
