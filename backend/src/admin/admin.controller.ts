import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody
} from '@nestjs/swagger';
import { Admin } from './entities/admin.entity';
import { Request } from 'express';
import { SearchAdminDto } from './dto/search-admin.dto';
import { RoleType } from 'src/role/enum/role.enum';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post('create-admin')
    @ApiOperation({
        summary: 'Create a new admin user',
        description:
            'Creates a new admin user with the provided details. Only accessible by superadmins.'
    })
    @ApiResponse({
        status: 201,
        description: 'Admin user successfully created',
        type: Admin
    })
    @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - user does not have superadmin role'
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - email already in use'
    })
    @ApiBody({ type: CreateAdminDto })
    create(@Req() req: Request, @Body() createAdminDto: CreateAdminDto) {
        const adminId = (req as any)?.user.id;
        return this.adminService.create(adminId, req, createAdminDto);
    }

    @Post('find-admins')
    @ApiOperation({
        summary: 'Get all admin users',
        description:
            'Returns a list of all admin users. For superadmins, returns all users. For agents, filters out superadmins.'
    })
    @ApiResponse({
        status: 200,
        description: 'List of admin users',
        type: [Admin]
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    async findAll(@Req() req: Request, @Body() dto: SearchAdminDto) {
        const userId = (req as any)?.user.id;
        return await this.adminService.findAll(userId, dto);
    }

    @Post('get-all-admins')
    getAllAdmins(@Req() req: Request, @Body('roleName') roleName?: RoleType | undefined) {
        const userRole = (req as any)?.user.role.name;
        const userId = (req as any)?.user.id;

        return this.adminService.getAdminsByRole(userId, userRole, roleName);
    }

    @Post('update-admin')
    @ApiOperation({
        summary: 'Update an admin user',
        description:
            'Updates an admin user with the provided details. Agents cannot update superadmins or promote to superadmin role.'
    })
    @ApiParam({ name: 'id', description: 'Admin ID', type: Number })
    @ApiBody({ type: UpdateAdminDto })
    @ApiResponse({
        status: 200,
        description: 'Admin user successfully updated',
        type: Admin
    })
    @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - admin with this ID does not exist'
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - email already in use'
    })
    async update(@Req() req: Request, @Body() updateAdminDto: UpdateAdminDto) {
        const adminId = (req as any)?.user.id;
        return this.adminService.update(adminId, req, updateAdminDto);
    }

    @Post('change-password')
    changePassword(@Req() req: Request, @Body() dto: UpdateAdminDto) {
        const adminId = (req as any)?.user.id;
        return this.adminService.changePassword(adminId, req, dto);
    }

    @Post('update-profile')
    updateProfile(@Req() req: Request, @Body() dto: UpdateAdminDto) {
        const adminId = (req as any)?.user.id;
        return this.adminService.updateProfile(adminId, dto);
    }

    @Post('change-role')
    changeRole(@Req() req: Request, @Body() dto: UpdateAdminDto) {
        const adminId = (req as any)?.user.id;
        return this.adminService.changeRole(adminId, req, dto);
    }

    @Post('get-members')
    getMembers(@Req() req: Request, @Body() dto: SearchAdminDto) {
        const adminId = (req as any)?.user.id;
        return this.adminService.findMembers(adminId, dto);
    }

    @Post('delete-admin')
    delete(@Req() req: Request, @Body('id') id: number) {
        const adminId = (req as any)?.user.id;
        return this.adminService.delete(adminId, id, req);
    }

    @Post('get-deleted-admins')
    getDeleted(@Req() req: Request, @Body() dto: SearchAdminDto) {
        const adminId = (req as any)?.user.id;
        return this.adminService.getDeleted(adminId, dto);
    }

    @Post('restore-admin')
    restore(@Req() req: Request, @Body('id') id: number) {
        const adminId = (req as any)?.user.id;
        return this.adminService.restore(adminId, id, req);
    }
}
