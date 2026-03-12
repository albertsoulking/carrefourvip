import { IsNotEmpty, IsString } from "class-validator";

export class CreateLuckyWheelDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    prizes: string;
}
