import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString
} from 'class-validator';
import { UserMode } from 'src/users/enum/user.enum';
import {
    DeliveryMethod,
    OrderStatus,
    PaymentStatus
} from '../enums/order.enum';
import { TransactionMethod } from 'src/transactions/enum/transactions.enum';
import { Type } from 'class-transformer';

export class SearchOrderDto {
    @IsNumberString()
    @IsOptional()
    orderId?: number;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsNumber()
    @IsOptional()
    parentId?: number;

    @IsEnum(UserMode)
    @IsOptional()
    mode?: UserMode;

    @IsEnum(DeliveryMethod)
    @IsOptional()
    deliveryMethod?: DeliveryMethod;

    @IsEnum(TransactionMethod)
    @IsOptional()
    payMethod?: TransactionMethod;

    @IsEnum(TransactionMethod)
    @IsOptional()
    hybridMethod?: TransactionMethod;

    @IsNumberString()
    @IsOptional()
    balanceLessThan?: string;

    @IsNumberString()
    @IsOptional()
    balanceGreaterThan?: string;

    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;

    @IsEnum(PaymentStatus)
    @IsOptional()
    paymentStatus?: PaymentStatus;

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
