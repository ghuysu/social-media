import { ChangeBirthdayDto, TokenPayloadInterface } from '@app/common';

export interface ChangeBirthdayInterface {
  birthdayPayload: ChangeBirthdayDto;
  userPayload: TokenPayloadInterface;
}
