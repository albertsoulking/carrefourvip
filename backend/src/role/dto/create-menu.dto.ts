import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    path?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsNumber()
    parentId?: number;
}
