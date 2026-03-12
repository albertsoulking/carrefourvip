import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth
} from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';
import { AdminMessageService } from './messages.admin.service';

@ApiTags('admin/messages')
@Controller('admin/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminMessageController {
    constructor(private readonly adminMessageService: AdminMessageService) {}

    @Post('get-all-messages')
    getAll(@Req() req: Request, @Body('ticketId') ticketId: number) {
      const adminId = (req as any)?.user.id;  
      return this.adminMessageService.getAll(adminId, ticketId);
    }

    @Post('send-message')
    send(@Req() req: Request, @Body() dto: CreateMessageDto) {
        const adminId = (req as any)?.user.id;
        return this.adminMessageService.create(adminId, dto, req);
    }

    @Post('delete-message')
    delete(@Req() req: Request, @Body('msgId') msgId: number) {
      const adminId = (req as any)?.user.id;
      return this.adminMessageService.delete(adminId, msgId, req);
    }
}
