import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString
} from 'class-validator';
import { UserMode } from 'src/users/enum/user.enum';

export class SearchProductDto {
    @IsString()
    @IsOptional()
    query?: string;

    @IsNumberString()
    @IsOptional()
    userId?: number;

    @IsNumberString()
    @IsOptional()
    productId?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(UserMode)
    @IsOptional()
    mode?: UserMode;

    @IsNumber()
    @IsOptional()
    categoryId?: number;

    @IsNumberString()
    @IsOptional()
    balanceLessThan?: string;

    @IsNumberString()
    @IsOptional()
    balanceGreaterThan?: string;

    @IsNumber()
    @IsOptional()
    isAvailable?: number;

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
    hasHot?: boolean;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    cusDate?: Date;

    @IsNumber()
    @IsOptional()
    isRandom?: number;
}
