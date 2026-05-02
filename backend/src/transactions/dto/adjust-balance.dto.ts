import { ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsNumber,
    IsPositive,
    IsString,
    MinLength
} from 'class-validator';
import { TransactionDirection } from '../enum/transactions.enum';

export class AdjustBalanceDto {
    @ApiProperty()
    @IsNumber()
    userId: number;

    @ApiProperty({ enum: TransactionDirection })
    @IsEnum(TransactionDirection)
    direction: TransactionDirection;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    amount: number;

    @ApiProperty()
    @IsString()
    @MinLength(3)
    remark: string;
}
