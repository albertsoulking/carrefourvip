import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entity/permission.entity';
import { AdminPermission } from './entity/admin_permission.entity';
import { RolePermission } from './entity/role_permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Menu } from 'src/role/entity/menu.entity';
import { Role } from 'src/role/entity/role.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { LogModule } from 'src/system_log/log.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Permission,
            AdminPermission,
            RolePermission,
            Menu,
            Role,
            Admin
        ]),
        LogModule
    ],
    controllers: [PermissionController],
    providers: [PermissionService],
    exports: [PermissionService, TypeOrmModule]
})
export class PermissionModule {}
