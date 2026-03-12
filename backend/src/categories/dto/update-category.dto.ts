import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';

export class UpdateCategoryDto {
    @ApiProperty({
        description: 'Category ID',
        example: 1,
        type: Number
    })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({
        description: 'Category Name',
        example: 'Food',
        type: String
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Category Status',
        example: true,
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Category Sort Number',
        example: 1,
        type: Number
    })
    @IsOptional()
    @IsNumber()
    displayOrder?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    vatPercent?: number;

    @IsOptional()
    @IsBoolean()
    isCollect?: boolean;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    bgImageUrl?: string;
}
