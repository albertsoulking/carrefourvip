import { PartialType } from '@nestjs/swagger';
import { CreatePaymentGatewayDto } from './create-payment-gateway.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentGatewayStatus } from '../enum/payment-gateways.enum';

export class UpdatePaymentGatewayDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    logo?: string;

    @IsString()
    @IsOptional()
    images?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    notices?: string;

    @IsString()
    @IsOptional()
    exLogos?: string;

    @IsString()
    @IsOptional()
    status?: PaymentGatewayStatus;

    @IsNumber()
    @IsOptional()
    sortOrder?: number;

    @IsString()
    @IsOptional()
    discount?: string;

    @IsString()
    @IsOptional()
    blackList?: string;

    @IsNumber()
    @IsOptional()
    isManual?: number;

    @IsNumber()
    @IsOptional()
    visible?: number;

    @IsString()
    @IsOptional()
    config?: string;
}
