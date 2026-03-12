import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SettingAdminService } from './setting.admin.service';
import { SearchSettingDto } from './dto/search-setting.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/settings')
@Controller('admin/settings')
export class AdminSettingController {
    constructor(private readonly settingAdminService: SettingAdminService) {}

    @Post('reset-setting')
    reset(@Req() req: Request, @Body() dto: UpdateSettingDto) {
        const adminId = (req as any)?.user.id;
        return this.settingAdminService.reset(adminId, req, dto);
    }

    @Post('update-setting')
    update(@Req() req: Request, @Body() dto: UpdateSettingDto) {
        const adminId = (req as any)?.user.id;
        return this.settingAdminService.update(adminId, req, dto);
    }

    @Post('get-setting')
    get(@Req() req: Request, @Body() dto: SearchSettingDto) {
        const adminId = (req as any)?.user.id;
        return this.settingAdminService.get(adminId, dto);
    }
}
