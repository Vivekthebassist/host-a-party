import { IsString, IsEnum, IsOptional, Length } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @Length(1, 2000)
  content: string;

  @IsOptional()
  @IsEnum(['text', 'image', 'emoji'])
  type?: string;
}
