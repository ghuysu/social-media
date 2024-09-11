import { Controller, Get } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller()
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get()
  getHello(): string {
    return this.reportingService.getHello();
  }
}
