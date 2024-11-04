import { IsObject, IsString } from 'class-validator';

// Sửa lại EmitMessageDto
export class EmitMessageDto {
  @IsString()
  name: string;

  @IsObject()
  payload: object;
}
