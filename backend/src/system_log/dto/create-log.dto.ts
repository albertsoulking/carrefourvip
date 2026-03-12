import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

export class CreateLogDto {
    @IsNumber()
    @IsOptional()
    adminId?: number;

    @IsNumber()
    @IsOptional()
    userId?: number;

    @IsEnum(UserType)
    @IsNotEmpty()
    userType: UserType;

    @IsString()
    @IsNotEmpty()
    action: string;

    @IsString()
    @IsNotEmpty()
    targetType: string;

    @IsNumber()
    @IsOptional()
    targetId?: number;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    ipAddress?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    zipCode?: string;

    @IsString()
    @IsOptional()
    country?: string;
}
