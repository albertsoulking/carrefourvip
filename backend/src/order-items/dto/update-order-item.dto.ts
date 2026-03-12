import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item.dto';
import { Max, Min, IsInt, IsOptional } from 'class-validator';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {
    @ApiProperty({
        description: 'Quantity of selected food',
        example: 1
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(99)
    quantity?: number;
}
