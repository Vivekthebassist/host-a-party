import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  Length,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @Length(3, 200)
  title: string;

  @IsString()
  @Length(10, 2000)
  description: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsString()
  venue: string;

  @IsString()
  @Length(5, 200)
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsNumber()
  @Min(1)
  maxGuests: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  partyModeEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
