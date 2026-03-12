import {
    IsNotEmpty,
    IsString,
    MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
    @ApiProperty({
        description: 'The name of the admin user',
        example: 'John Doe'
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    name: string;

    @ApiProperty({
        description: 'Email address of the admin user (must be unique)',
        example: 'admin@foodpoint.com'
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    email: string;

    @ApiProperty({
        description: 'Password for the admin account (min 6 characters)',
        example: 'securePassword123',
        minLength: 6
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    password: string;

    @ApiProperty({
        description: 'Role of the admin',
        example: 'admin',
        enum: ['admin', 'agent', 'team', 'customer'],
        required: false,
        default: 'agent'
    })
    @IsString()
    @IsNotEmpty()
    roleName: string;

    @ApiProperty({
        description: 'Unique referral code for user registration',
        example: 'ADMIN123',
        required: false
    })
    @IsNotEmpty()
    @IsString()
    referralCode: string;
}
