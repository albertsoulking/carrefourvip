import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-location.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
    @ApiProperty({
        description: 'Locations id',
        example: 1
    })
    @IsNotEmpty()
    @IsNumber()
    id: number;
}
