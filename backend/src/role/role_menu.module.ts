import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entity/role.entity';
import { RoleMenu } from './entity/role_menu.entity';
import { Menu } from './entity/menu.entity';
import { RoleMenuController } from './role_menu.controller';
import { RoleMenuService } from './role_menu.service';
import { RolePermission } from 'src/permission/entity/role_permission.entity';
import { Permission } from 'src/permission/entity/permission.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { AdminPermission } from 'src/permission/entity/admin_permission.entity';
import { AdminMenu } from './entity/admin_menu.entity';
import { LogModule } from 'src/system_log/log.module';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Role,
            RoleMenu,
            Menu,
            RolePermission,
            Permission,
            Admin,
            AdminPermission,
            AdminMenu
        ]),
        LogModule,
        PermissionModule
    ],
    controllers: [RoleMenuController],
    providers: [RoleMenuService],
    exports: [RoleMenuService, TypeOrmModule]
})
export class RoleMenuModule {}
