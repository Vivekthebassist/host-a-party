import { IsString, IsOptional, Length, Matches, IsBoolean, IsEnum, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' })
  username?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

export class UpdateLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  city?: string;
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  appearance?: string;

  @IsOptional()
  @IsBoolean()
  locationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  showProfileInPartyMode?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotificationsEnabled?: boolean;
}
