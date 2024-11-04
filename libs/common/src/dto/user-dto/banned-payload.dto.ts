import { IsDate, IsNumber } from 'class-validator';

export class BannedPayloadDto {
  @IsNumber()
  numberOfBannedDays: number;

  @IsDate()
  expirationTime: Date;
}
