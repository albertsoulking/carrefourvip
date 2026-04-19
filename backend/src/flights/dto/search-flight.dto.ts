import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class SearchFlightDto {
  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsNumber()
  adults: number;

  @IsNumber()
  children: number;

  @IsString()
  departureDate: string;

  @IsOptional()
  @IsString()
  returnDate?: string;

  @IsString()
  tripClass?: string;

  @IsBoolean()
  oneWay: boolean;
}
