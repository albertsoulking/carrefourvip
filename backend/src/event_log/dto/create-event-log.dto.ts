import { IsNotEmpty, IsNumber, IsNumberString } from "class-validator";

export class CreateEventLogDto {
    @IsNumberString()
    @IsNotEmpty()
    eventId: Number;

    @IsNumber()
    @IsNotEmpty()
    prizeId: number;
}
