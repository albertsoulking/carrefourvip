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
import { UserMode } from '../enum/user.enum';
import { Type } from 'class-transformer';

export class SearchUserDto {
    @IsNumberString()
    @IsOptional()
    userId?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsNumberString()
    @IsOptional()
    balanceLessThan?: string;

    @IsNumberString()
    @IsOptional()
    balanceGreaterThan?: string;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsNumber()
    @IsOptional()
    status?: number;

    @IsEnum(UserMode)
    @IsOptional()
    mode?: UserMode;

    @IsNumber()
    @IsOptional()
    parentId?: number;

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
    hasOrder?: boolean;

    @IsBoolean()
    @IsOptional()
    hasValue?: boolean;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    cusDate?: Date;
}
