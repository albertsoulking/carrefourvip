import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsOptional, Min, Max, IsDecimal, IsJSON, IsNumber, IsArray, IsNotEmpty } from 'class-validator';

export class CreateOrderItemDto {
    @ApiProperty({
        description: 'Product id',
        example: 1,
        type: Number,
        required: true
    })
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    productId: number

    @ApiProperty({
        description: 'Product Name',
        example: 1,
        type: String,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    productName: string

    @ApiProperty({
        description: 'Product Image',
        example: 'product.jpg',
        type: String,
        required: false,
        nullable: true
    })
    @IsString()
    @IsOptional()
    productImage?: string

    @ApiProperty({
        description: 'Product Description',
        example: 'This is product description',
        type: String,
        required: false,
        nullable: true
    })
    @IsString()
    @IsOptional()
    productDesc?: string

    @ApiProperty({
        description: 'Quantity of selected product',
        example: 1,
        type: Number,
        required: true
    })
    @Min(1)
    @Max(99)
    @IsInt()
    @IsPositive()
    quantity: number;

    @ApiProperty({
        description: 'Unit price of selected product',
        example: '10.00',
        type: String,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    unitPrice: string;

    @ApiProperty({
        description: 'Total price of selected product',
        example: '100.00',
        type: String,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    totalPrice: string;
}