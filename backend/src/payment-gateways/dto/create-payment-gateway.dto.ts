import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentGatewayDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    providerId: number;

    @IsString()
    @IsOptional()
    config?: string;
}
