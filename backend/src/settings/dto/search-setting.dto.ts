import { IsNotEmpty, IsString } from "class-validator";

export class SearchSettingDto {
    @IsNotEmpty()
    @IsString()
    group: string;

    @IsNotEmpty()
    @IsString()
    key: string;
}
