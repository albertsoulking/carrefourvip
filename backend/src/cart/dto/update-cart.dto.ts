import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, Min } from "class-validator";

export class UpdateCartDto {
    @ApiProperty({
        description: 'Cart ID',
        example: 1,
        type: Number,
        required: true
    })
    @IsNumber()
    @IsPositive()
    id: number;

    @ApiProperty({
        description: 'Product quantity',
        example: 10,
        type: Number,
        required: true
    })
    @IsNumber()
    @Min(0)
    quantity: number;
}