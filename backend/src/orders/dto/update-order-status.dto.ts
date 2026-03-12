import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DeliveryMethod, OrderStatus, PaymentStatus } from '../enums/order.enum';
import { TransactionMethod } from 'src/transactions/enum/transactions.enum';

export class UpdateOrderStatusDto {
    @ApiProperty({
        description: 'Order Id',
        example: 1
    })
    @IsNumber()
    id: number;

    @ApiProperty({
        description: 'New status of the order',
        enum: OrderStatus,
        example: OrderStatus.PENDING
    })
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ApiProperty({
        description: 'PayPal ID',
        example: '5XS08044L2811202V',
        type: String
    })
    @IsString()
    @IsOptional()
    transactionNumber?: string;

    @ApiProperty({
        description: 'Payment Amount',
        example: '100.00',
        type: String
    })
    @IsString()
    @IsOptional()
    amount?: string;

    @ApiProperty({
        description: 'Payment Link',
        example: 'https://example.com/pay/1a2b3c-4d5e6f-7g8h9i0j'
    })
    @IsString()
    @IsOptional()
    paymentLink?: string;

    @ApiProperty({
        description: 'Payment Type',
        example: PaymentStatus.PAID
    })
    @IsEnum(PaymentStatus)
    @IsOptional()
    paymentStatus?: PaymentStatus;

    @IsEnum(DeliveryMethod)
    @IsOptional()
    deliveryMethod?: DeliveryMethod;

    @IsEnum(TransactionMethod)
    @IsOptional()
    payMethod?: TransactionMethod;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsString()
    @IsOptional()
    deliveryProofImages?: string;

    @IsString()
    @IsOptional()
    paypalResponseRaw?: string;
}
