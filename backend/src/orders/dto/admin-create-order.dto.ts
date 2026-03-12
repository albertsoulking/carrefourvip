import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString
} from 'class-validator';
import { TransactionMethod } from 'src/transactions/enum/transactions.enum';
import { DeliveryMethod } from '../enums/order.enum';

export class AdminCreateOrderDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;
    
    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsString()
    @IsNotEmpty()
    userAddress: string;

    @IsString()
    @IsNotEmpty()
    userMobile: string;

    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsNotEmpty()
    imageUrl: string;
   
    @IsString()
    @IsNotEmpty()
    quantity: string;

    @IsString()
    @IsNotEmpty()
    payAmount: string;

    @IsEnum(TransactionMethod)
    @IsNotEmpty()
    payMethod: TransactionMethod;

    @IsEnum(DeliveryMethod)
    @IsNotEmpty()
    deliveryMethod: DeliveryMethod;
}
