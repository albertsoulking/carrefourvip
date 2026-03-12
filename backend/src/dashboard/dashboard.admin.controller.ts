import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './dashboard.admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('admin/dashboard')
export class AdminDashboardController {
    constructor(private readonly adminDashboardService: AdminDashboardService) {}

    @Post('get-dashboard-overview')
    getDashboardOverview(@Req() req: Request) {
        const adminId = (req as any)?.user.id;
        return this.adminDashboardService.getDashboardOverview(adminId);
    }
}
