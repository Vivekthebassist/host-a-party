import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class SetupProfileDto {
  @IsString()
  @Length(2, 100)
  fullName: string;

  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' })
  username: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
