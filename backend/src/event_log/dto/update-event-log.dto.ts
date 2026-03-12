import { IsNotEmpty, IsNumber, IsNumberString } from "class-validator";

export class UpdateEventLogDto {
    @IsNumberString()
    @IsNotEmpty()
    id: number;

    @IsNumber()
    @IsNotEmpty()
    prizeId: number;
}
