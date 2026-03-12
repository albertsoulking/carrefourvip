import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl
} from 'class-validator';

export class UpdateProductDto {
    @ApiProperty({
        description: 'Product ID',
        example: 1,
        type: Number
    })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({
        description: 'Name of the product item',
        example: 'Chicken Burger'
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Description of the product item',
        example: 'Juicy chicken patty with lettuce, tomato, and special sauce',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Regular price of the product item',
        example: 9.99
    })
    @IsOptional()
    @IsString()
    price?: string;

    @ApiProperty({
        description: 'URL to the product image',
        example: 'https://example.com/images/chicken-burger.jpg',
        required: false,
        nullable: true
    })
    @IsOptional()
    @IsUrl()
    imageUrl?: string | null;

    @ApiProperty({
        description: 'Category ID of the product',
        example: 1
    })
    @IsOptional()
    @IsNumber()
    categoryId?: number;

    @ApiProperty({
        description: 'Whether the product is available',
        example: true,
        default: true,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @IsOptional()
    @IsString()
    imageList?: string;

    @IsOptional()
    @IsString()
    attributes?: string;

    @IsOptional()
    @IsString()
    attrGroups?: string;
}
