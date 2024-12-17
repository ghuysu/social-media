import { IsString, Matches } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @Matches(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/, {
    message: 'Refresh token must be in Bearer token format',
  })
  refreshToken: string;
}
