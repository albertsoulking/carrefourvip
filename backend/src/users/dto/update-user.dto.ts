import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserMode } from '../enum/user.enum';

export class UpdateUserDto {
    // All fields from CreateUserDto are now optional for PATCH operations
    @IsNumber()
    id: number;

    @ApiProperty({
        description: 'User avatar',
        example: 'user-avatar.jpg',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    avatar?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsBoolean()
    status?: boolean;

    @IsOptional()
    @IsString()
    remark?: string;

    @IsOptional()
    @IsNumber()
    parentId?: number;

    @IsOptional()
    @IsEnum(UserMode)
    mode?: UserMode;

    @IsOptional()
    @IsString()
    balance?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    point?: string;
  }
