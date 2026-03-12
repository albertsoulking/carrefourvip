import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';
import { SearchTicketDto } from './dto/search-ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Post('create-ticket')
    create(@Req() req: Request, @Body() body: CreateTicketDto) {
        const userId = (req as any)?.user.id;
        return this.ticketsService.create(userId, body);
    }

    @Post('get-my-tickets')
    getAll(
        @Req() req: Request,
        @Body() dto: SearchTicketDto
    ) {
        const userId = (req as any)?.user.id;
        return this.ticketsService.getAll(userId, dto);
    }

    @Post('read-ticket')
    readTicket(@Req() req: Request, @Body('id') id: number) {
        const userId = (req as any)?.user.id;
        return this.ticketsService.readTicket(userId, id);
    }
}
