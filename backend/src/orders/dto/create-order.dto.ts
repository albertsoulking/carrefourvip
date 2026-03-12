import {
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionMethod } from 'src/transactions/enum/transactions.enum';
import { DeliveryMethod } from '../enums/order.enum';

export class CreateOrderDto {
    @ApiProperty({
        description: 'Street address',
        example: 'No.2 Wall Street',
        type: String,
        required: true
    })
    @IsNotEmpty()
    @IsOptional()
    userAddress?: string;

    @ApiProperty({
        description: 'Customer phone number',
        example: '09123456789',
        type: String,
        required: true
    })
    @IsNotEmpty()
    @IsOptional()
    userMobile?: string;

    @ApiProperty({
        description: 'Customer name',
        example: 'John Doe',
        type: String,
        required: true
    })
    @IsNotEmpty()
    @IsOptional()
    userName?: string;

    @ApiProperty({
        description: 'First Image of order item',
        example: '/order-item.jpg',
        type: String,
        required: false
    })
    @IsOptional()
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({
        description: 'Number of order items',
        example: 10,
        type: Number,
        required: true
    })
    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @ApiProperty({
        description: 'Order subtotal',
        example: '100.00',
        default: '0.00',
        type: String,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    subtotal: string;

    @ApiProperty({
        description: 'Order vat',
        example: '9.99',
        default: '0.00',
        type: String,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    vat: string;

    @ApiProperty({
        description: 'Order delivery fees',
        example: '4.99',
        default: '0.00',
        type: String,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    deliveryFee: string;

    @ApiProperty({
        description: 'Order total price',
        example: '59.99',
        default: '0.00',
        type: String,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    totalPrice: string;

    @IsString()
    @IsNotEmpty()
    discountPayPal: string;

    @IsString()
    @IsNotEmpty()
    balanceDeduct: string;
    
    @IsString()
    @IsNotEmpty()
    payAmount: string;

    @IsEnum(TransactionMethod)
    @IsNotEmpty()
    payMethod: TransactionMethod;

    @IsEnum(TransactionMethod)
    @IsNotEmpty()
    hybridMethod: TransactionMethod;

    @IsEnum(DeliveryMethod)
    @IsNotEmpty()
    deliveryMethod: DeliveryMethod;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    selectedItems: number[]
}
