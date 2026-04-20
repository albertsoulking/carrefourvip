import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';
import { FlightBookingStatus } from '../enum/flight-booking.enum';

export class UpdateFlightBookingDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsEnum(FlightBookingStatus)
    status?: FlightBookingStatus;

    @IsOptional()
    @IsString()
    paymentLink?: string;
}
