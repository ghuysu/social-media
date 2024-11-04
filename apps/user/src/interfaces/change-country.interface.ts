import { ChangeCountryDto, TokenPayloadInterface } from '@app/common';

export interface ChangeCountryInterface {
  countryPayload: ChangeCountryDto;
  userPayload: TokenPayloadInterface;
}
