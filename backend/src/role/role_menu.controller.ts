import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleMenuService } from './role_menu.service';
import { UpdateRoleMenusDto } from './dto/update-role_menu.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/role-menus')
@Controller('admin/role-menus')
export class RoleMenuController {
    constructor(private roleMenuService: RoleMenuService) {}

    // role
    @Post('get-roles')
    getRoles(
        @Body('page') page: number,
        @Body('limit') limit: number,
        @Body('orderBy') orderBy: string,
        @Body('sortBy') sortBy: string
    ) {
        return this.roleMenuService.getRoles(page, limit, orderBy, sortBy);
    }

    // menu
    @Post('get-menus-by-permission')
    getMenus(@Body('id') id: number) {
        return this.roleMenuService.getMenusByPermission(id);
    }

    @Post('get-admin-access')
    getAdminAccess(@Body('id') id: number) {
        return this.roleMenuService.getAdminAccess(id);
    }

    @Post('update-admin-access')
    updateAdminAccess(
        @Req() req: Request,
        @Body('id') id: number,
        @Body('menuIds') menuIds: number[],
        @Body('permissionIds') permissionIds: number[]
    ) {
        const adminId = (req as any)?.user.id;
        return this.roleMenuService.updateAdminAccess(adminId, req, id, permissionIds, menuIds);
    }

    // role menu
    @Post('get-menus')
    async getRoleMenus(@Req() req: any) {
        const userId = (req as any)?.user.id;
        return this.roleMenuService.getMenus(userId);
    }

    @Post('update-menus-by-role')
    async updateMenusByRole(@Body() dto: UpdateRoleMenusDto) {
        return this.roleMenuService.updateMenusByRole(dto);
    }
    
    @Post('reset-role-menus')
    reset() {
        return this.roleMenuService.reset();
    }
}
