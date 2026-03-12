import { Type } from 'class-transformer';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString
} from 'class-validator';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

export class SearchLogDto {
    @IsNumberString()
    @IsOptional()
    logId?: number;

    @IsNumberString()
    @IsOptional()
    adminId?: number;

    @IsNumberString()
    @IsOptional()
    userId?: number;

    @IsEnum(UserType)
    @IsOptional()
    userType?: UserType;

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
