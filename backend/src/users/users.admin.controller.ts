import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminUserService } from './users.admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/users')
@Controller('admin/users')
export class AdminUserController {
    constructor(private adminUserService: AdminUserService) {}

    @Post('get-all-users')
    getAll(
        @Req() req: Request,
        @Body() dto: SearchUserDto
    ) {
        const adminId = (req as any)?.user.id;
        return this.adminUserService.getAll(
            adminId,
            dto
        );
    }

    @Post('update-user')
    update(@Req() req: Request, @Body() dto: UpdateUserDto) {
        const adminId = (req as any)?.user.id;
        return this.adminUserService.update(adminId, req, dto);
    }

    @Post('create-user')
    create(@Req() req: Request, @Body() dto: CreateUserDto) {
        const adminId = (req as any)?.user.id;
        return this.adminUserService.create(adminId, req, dto);
    }

    @Post('change-password')
    changePassword(@Req() req: Request, @Body() dto: UpdateUserDto) {
        const adminId = (req as any)?.user.id;
        return this.adminUserService.changePassword(adminId, req, dto);
    }

    @Post('delete-user')
    delete(@Req() req: Request, @Body('id') id: number) {
        const adminId = (req as any)?.user.id;
        return this.adminUserService.delete(adminId, id, req)
    }

    @Post('get-deleted-users')
    getDeleted(@Req() req: Request, @Body() dto: SearchUserDto) {
        const adminId = (req as any)?.user.id;
        return this.adminUserService.getDeleted(adminId, dto)
    }

    @Post('restore-user')
    restore(@Req() req: Request, @Body('id') id: number) {
        const adminId = (req as any)?.user.id;
        return this.adminUserService.restore(adminId, id, req);
    }
}
