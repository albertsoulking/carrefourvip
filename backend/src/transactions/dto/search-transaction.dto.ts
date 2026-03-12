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
    TransactionDirection,
    TransactionMethod,
    TransactionStatus,
    TransactionType
} from '../enum/transactions.enum';
import { Type } from 'class-transformer';

export class SearchTransactionDto {
    @IsNumberString()
    @IsOptional()
    transactionId?: number;

    @IsEnum(UserMode)
    @IsOptional()
    mode?: UserMode;

    @IsString()
    @IsOptional()
    email?: string;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsEnum(TransactionDirection)
    @IsOptional()
    direction?: TransactionDirection;

    @IsEnum(TransactionMethod)
    @IsOptional()
    method?: TransactionMethod;

    @IsEnum(TransactionMethod)
    @IsOptional()
    hybridMethod?: TransactionMethod;

    @IsEnum(TransactionStatus)
    @IsOptional()
    status?: TransactionStatus;

    @IsNumber()
    @IsOptional()
    parentId?: number;

    @IsNumberString()
    @IsOptional()
    balanceLessThan?: string;

    @IsNumberString()
    @IsOptional()
    balanceGreaterThan?: string;

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
