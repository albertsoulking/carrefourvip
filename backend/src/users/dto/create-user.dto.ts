import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength
} from 'class-validator';
import { UserMode } from '../enum/user.enum';

export class CreateUserDto {
    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
        maxLength: 100
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john@example.com',
        maxLength: 150
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Phone number of the user (international format with +)',
        example: '+1234567890',
        maxLength: 20
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message:
            'phone must be a valid international phone number with country code (e.g., +1234567890)'
    })
    phone: string;

    @ApiProperty({
        description: 'Password for the user account (min 6 characters)',
        example: 'securePassword123',
        minLength: 6
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    referralCode?: string;

    @IsNotEmpty()
    @IsEnum(UserMode)
    mode: UserMode;
}
