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
import { LoginType, UserType } from '../enum/login-activities.enum';
import { RoleType } from 'src/role/enum/role.enum';
import { UserMode } from 'src/users/enum/user.enum';

export class SearchLoginActivityDto {
    @IsDate()
    @IsNumberString()
    @IsOptional()
    activityId?: number;

    @IsNumberString()
    @IsOptional()
    userId?: number;

    @IsNumberString()
    @IsOptional()
    adminId?: number;

    @IsNumber()
    @IsOptional()
    parentId?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsEnum(UserMode)
    @IsOptional()
    mode?: UserMode;

    @IsEnum(LoginType)
    @IsOptional()
    type?: LoginType;

    @IsEnum(UserType)
    @IsOptional()
    userType?: UserType;

    @IsEnum(RoleType)
    @IsOptional()
    roleType?: RoleType;

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
