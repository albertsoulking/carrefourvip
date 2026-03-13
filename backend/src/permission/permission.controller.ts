import { Controller, Post, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/permissions')
@Controller('admin/permissions')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Post('reset-permission')
    reset() {
        return this.permissionService.reset();
    }
}
