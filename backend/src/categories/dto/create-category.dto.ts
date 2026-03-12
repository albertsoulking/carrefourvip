import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Name of the category',
        example: 'Fast Food'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    bgImageUrl?: string;
}
