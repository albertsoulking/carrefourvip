import { IsNotEmpty, IsNumber, IsNumberString } from "class-validator";

export class UpdateEventDto{
    @IsNumberString()
    @IsNotEmpty()
    eventId: number;

    @IsNumber()
    @IsNotEmpty()
    prizeId: number;
}
