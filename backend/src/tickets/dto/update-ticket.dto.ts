import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsOptional,
    IsNumber,
    IsNotEmpty
} from 'class-validator';
import { TicketStatus } from '../enum/tickets.enum';

export class UpdateTicketDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiPropertyOptional({
        description: 'New status of the ticket',
        enum: TicketStatus
    })
    @IsEnum(TicketStatus)
    @IsOptional()
    status: TicketStatus;
}
