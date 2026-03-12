import {
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchCategoryDto {
    @IsNumberString()
    @IsOptional()
    categoryId?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    isActive?: number;

    @IsNumber()
    @IsOptional()
    isCollect?: number;

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

    @IsBoolean()
    @IsOptional()
    hasProduct?: boolean;

    @IsBoolean()
    @IsOptional()
    hasMost?: boolean;
}
