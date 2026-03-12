import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSettingDto {
    @IsNotEmpty()
    @IsString()
    group: string;

    @IsNotEmpty()
    @IsString()
    key: string;

    @IsNotEmpty()
    @IsString()
    value: string;

    @IsOptional()
    @IsString()
    remark?: string;
}
