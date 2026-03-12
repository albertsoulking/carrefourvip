import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { LoginType, UserType } from '../enum/login-activities.enum';

export class CreateLoginActivityDto {
    @ApiProperty({ description: 'ID of the user or admin' })
    @IsNumber()
    userId: number;

    @ApiProperty({
        description: 'Type of user (user or admin)',
        enum: UserType,
        example: UserType.USER
    })
    @IsEnum(UserType)
    userType: UserType;

    @ApiProperty({
        description: 'Type of login activity',
        enum: LoginType,
        example: LoginType.LOGIN,
        default: LoginType.LOGIN
    })
    @IsEnum(LoginType)
    @IsOptional()
    type?: LoginType;

    @ApiProperty({ description: 'IP address', required: false })
    @IsString()
    @IsOptional()
    ip?: string;

    @ApiProperty({ description: 'Browser information', required: false })
    @IsString()
    @IsOptional()
    browser?: string;

    @ApiProperty({ description: 'Device information', required: false })
    @IsString()
    @IsOptional()
    device?: string;

    @ApiProperty({
        description: 'Operating system information',
        required: false
    })
    @IsString()
    @IsOptional()
    os?: string;

    @ApiProperty({ description: 'Additional details', required: false })
    @IsString()
    @IsOptional()
    details?: string;

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
