import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateCartDto {
    @ApiProperty({
        description: 'Product ID',
        example: 1,
        required: true
    })
    @IsNumber()
    @IsPositive()
    productId: number;
    
    @ApiProperty({
        description: 'Number of product in carts',
        example: 1,
        required: true
    })
    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;
    
    @IsOptional()
    @IsString()
    attributes?: string;

    @IsString()
    @IsNotEmpty()
    basePrice: string;

    @IsString()
    @IsNotEmpty()
    attrPrice: string;

    @IsString()
    @IsNotEmpty()
    unitPrice: string;

    @IsString()
    @IsNotEmpty()
    totalPrice: string;
}