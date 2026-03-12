import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Address line',
    example: '123 Main Street, Apt 4B',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'NY',
  })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Postal/Zip code',
    example: '10001',
  })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Whether this is the primary location',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({
    description: 'Receiver name for the address',
    example: 'John Doe',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  receiverName: string;

  @ApiProperty({
    description: 'Receiver mobile for the address',
    example: '+123456789',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  receiverMobile: string;
}
