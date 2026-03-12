import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/permissions')
@Controller('admin/permissions')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Post('reset-permission')
    reset(@Req() req: Request, @Body('adminId') adminId: number) {
        return this.permissionService.reset(req, adminId);
    }
}
