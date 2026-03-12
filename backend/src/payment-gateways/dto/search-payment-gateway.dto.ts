import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsNumberString,
    IsOptional,
    IsDate,
    IsNumber
} from 'class-validator';
import { PaymentGatewayType } from '../enum/payment-gateways.enum';
import { Type } from 'class-transformer';

export class SearchPaymentGatewayDto {
    @IsNumberString()
    @IsOptional()
    gatewayId?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    providerId?: number;

    @IsEnum(PaymentGatewayType)
    @IsOptional()
    type?: PaymentGatewayType;

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
