import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('system-noti')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt-Auth')
export class NotificationController {
    constructor(private readonly notiService: NotificationService) {}

    @Post('get-all-notifications')
    getAll(@Req() req: Request) {
        const adminId = (req as any)?.user.id;
        return this.notiService.getAll(adminId);
    }

    @Post('update-notification')
    update(@Req() req: Request, @Body('ids') ids: number[]) {
        const adminId = (req as any)?.user.id;
        return this.notiService.update(adminId, ids);
    }

    @Post('mark-all-as-read')
    markAllAsRead(@Req() req: Request) {
        const adminId = (req as any)?.user.id;
        return this.notiService.markAllAsRead(adminId);
    }
}
