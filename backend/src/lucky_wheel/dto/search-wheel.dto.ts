import { Type } from 'class-transformer';
import {
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString
} from 'class-validator';

export class SearchLuckyWheelDto {
    @IsNumberString()
    @IsOptional()
    luckyWheelId?: number;

    @IsString()
    @IsOptional()
    name?: string;

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
