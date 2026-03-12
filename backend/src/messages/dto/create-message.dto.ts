import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMessageDto {
    @IsNumber()
    @IsNotEmpty()
    ticketId: number;

    @IsString()
    @IsNotEmpty()
    message: string;
}
