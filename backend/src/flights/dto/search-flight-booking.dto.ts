import { Type } from 'class-transformer';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';
import { FlightBookingStatus } from '../enum/flight-booking.enum';

export class SearchFlightBookingDto {
    @IsOptional()
    @IsString()
    bookingReference?: string;

    @IsOptional()
    @IsString()
    contactName?: string;

    @IsOptional()
    @IsString()
    contactEmail?: string;

    @IsOptional()
    @IsString()
    airlineCode?: string;

    @IsOptional()
    @IsString()
    originCode?: string;

    @IsOptional()
    @IsString()
    destinationCode?: string;

    @IsOptional()
    @IsEnum(FlightBookingStatus)
    status?: FlightBookingStatus;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    fromDate?: Date;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    toDate?: Date;

    @IsNumber()
    @IsNotEmpty()
    page: number;

    @IsNumber()
    @IsNotEmpty()
    limit: number;

    @IsString()
    @IsNotEmpty()
    orderBy: string;

    @IsString()
    @IsNotEmpty()
    sortBy: string;
}
