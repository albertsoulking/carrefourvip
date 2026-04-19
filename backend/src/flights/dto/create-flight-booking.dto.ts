import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import {
    FlightCabinClass,
    FlightDocumentType,
    FlightPassengerType,
    FlightTripType
} from '../enum/flight-booking.enum';

export class CreateFlightPassengerDto {
    @IsEnum(FlightPassengerType)
    passengerType: FlightPassengerType;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    gender: string;

    @IsDateString()
    dateOfBirth: string;

    @IsString()
    @IsNotEmpty()
    nationality: string;

    @IsEnum(FlightDocumentType)
    documentType: FlightDocumentType;

    @IsString()
    @IsNotEmpty()
    documentNumber: string;

    @IsDateString()
    documentExpiry: string;
}

export class CreateFlightBookingDto {
    @IsString()
    @IsNotEmpty()
    airlineCode: string;

    @IsOptional()
    @IsString()
    airlineName?: string;

    @IsString()
    @IsNotEmpty()
    originCode: string;

    @IsOptional()
    @IsString()
    originCity?: string;

    @IsOptional()
    @IsString()
    originAirportName?: string;

    @IsString()
    @IsNotEmpty()
    destinationCode: string;

    @IsOptional()
    @IsString()
    destinationCity?: string;

    @IsOptional()
    @IsString()
    destinationAirportName?: string;

    @IsDateString()
    departureAt: string;

    @IsOptional()
    @IsDateString()
    returnAt?: string;

    @IsEnum(FlightTripType)
    tripType: FlightTripType;

    @IsEnum(FlightCabinClass)
    cabinClass: FlightCabinClass;

    @Type(() => Number)
    @IsNumber()
    adults: number;

    @Type(() => Number)
    @IsNumber()
    children: number;

    @Type(() => Number)
    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    providerLink?: string;

    @IsOptional()
    @IsString()
    contactTitle?: string;

    @IsString()
    @IsNotEmpty()
    contactFirstName: string;

    @IsString()
    @IsNotEmpty()
    contactLastName: string;

    @IsEmail()
    contactEmail: string;

    @IsString()
    @IsNotEmpty()
    contactPhone: string;

    @IsOptional()
    @IsString()
    specialRequests?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateFlightPassengerDto)
    passengers: CreateFlightPassengerDto[];

    @IsOptional()
    @IsObject()
    flightSnapshot?: Record<string, any>;
}
