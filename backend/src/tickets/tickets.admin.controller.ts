import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminTicketService } from './tickets.admin.service';
import { Request } from 'express';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { SearchTicketDto } from './dto/search-ticket.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/tickets')
@Controller('admin/tickets')
export class AdminTicketController {
    constructor(private readonly adminTicketService: AdminTicketService) {}

    @Post('get-all-tickets')
    getAll(@Req() req: Request, @Body() dto: SearchTicketDto) {
        const adminId = (req as any)?.user.id;
        return this.adminTicketService.getAll(adminId, dto);
    }

    @Post('update-ticket')
    update(@Req() req: Request, @Body() dto: UpdateTicketDto) {
        const adminId = (req as any)?.user.id;
        return this.adminTicketService.update(adminId, req, dto);
    }

    @Post('delete-ticket')
    delete(@Req() req: Request, @Body('id') id: number) {
        const adminId = (req as any)?.user.id;
        return this.adminTicketService.delete(adminId, id, req);
    }

    @Post('get-deleted-tickets')
    getDeleted(@Req() req: Request, @Body() dto: SearchTicketDto) {
        const adminId = (req as any)?.user.id;
        return this.adminTicketService.getDeleted(adminId, dto);
    }

    @Post('restore-product')
    restore(@Req() req: Request, @Body('id') id: number) {
        const adminId = (req as any)?.user.id;
        return this.adminTicketService.restore(adminId, id, req);
    }
}
