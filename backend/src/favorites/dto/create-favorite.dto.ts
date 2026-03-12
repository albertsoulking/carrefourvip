import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateFavoriteDto {
    @ApiProperty({
        description: 'Product ID',
        example: 1
    })
    @IsNotEmpty()
    @IsNumber()
    productId: number
};
