import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Email address of the admin user',
        example: 'admin@foodpoint.com',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({
        description: 'Password for the admin account (min 6 characters)',
        example: 'password123',
        minLength: 6,
        required: true
    })
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsString()
    @IsOptional()
    token?: string;
}
