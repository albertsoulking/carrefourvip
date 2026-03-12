import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePaymentGatewayDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    providerId: number;
}
