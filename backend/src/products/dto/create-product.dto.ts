import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsUrl,
} from 'class-validator';

export class CreateProductDto {
    @ApiProperty({
        description: 'Name of the food item',
        example: 'Chicken Burger'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Description of the food item',
        example: 'Juicy chicken patty with lettuce, tomato, and special sauce',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Regular price of the food item',
        example: 9.99
    })
    @IsNotEmpty()
    @IsString()
    price: string;

    @ApiProperty({
        description: 'URL to the food item image',
        example: 'https://example.com/images/chicken-burger.jpg',
        required: false,
        nullable: true
    })
    @IsOptional()
    @IsUrl()
    imageUrl?: string | null;

    @ApiProperty({
        description: 'Category ID of the food item',
        example: 1
    })
    @IsNotEmpty()
    @IsNumber()
    categoryId: number;

    @IsOptional()
    @IsString()
    attributes?: string;

    @IsOptional()
    @IsString()
    attrGroups?: string;
}
