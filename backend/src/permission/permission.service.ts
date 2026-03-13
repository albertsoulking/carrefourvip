import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Permission } from './entity/permission.entity';
import { Menu } from 'src/role/entity/menu.entity';
import { Role } from 'src/role/entity/role.entity';
import { RolePermission } from './entity/role_permission.entity';
import { customerPermissions } from './default/customer.permission';
import { orderPermission } from './default/order.permission';
import { categoryPermission } from './default/category.permission';
import { productPermission } from './default/product.permission';
import { maintenancePermission } from './default/maintenance.permission';
import { rolePermission } from './default/role.permission';
import { AdminPermission } from './entity/admin_permission.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { messagePermission } from './default/message.permission';
import { ticketPermission } from './default/ticket.permission';
import { adminPermissions } from './default/admin.permission';

@Injectable()
export class PermissionService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>,
        @InjectRepository(Menu)
        private readonly menuRepo: Repository<Menu>,
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(RolePermission)
        private readonly rolePermissionRepo: Repository<RolePermission>,
        @InjectRepository(AdminPermission)
        private readonly adminPermissionRepo: Repository<AdminPermission>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>
    ) {}

    async reset() {
        // 1. 备份旧的管理员权限 path
        const adminPermissions = await this.adminPermissionRepo.find({
            relations: ['admin', 'permission', 'permission.menu']
        });

        await this.dataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 0`);
        await this.dataSource.manager.query(`TRUNCATE TABLE role_permissions`);
        await this.dataSource.manager.query(`TRUNCATE TABLE permissions`);
        await this.dataSource.manager.query(`TRUNCATE TABLE admin_permissions`);
        await this.dataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 1`);

        // 2. 重新初始化
        await this.seedPermissions();

        // 3. 同步管理员菜单权限
        await this.syncAdminPermissions(adminPermissions);
    }

    async seedPermissions() {
        const defaultPermissions = [
            ...customerPermissions,
            ...orderPermission,
            ...categoryPermission,
            ...productPermission,
            ...maintenancePermission,
            ...rolePermission,
            ...messagePermission,
            ...ticketPermission,
            ...adminPermissions
        ];

        try {
            for (const item of defaultPermissions) {
                // 1. 检查权限是否存在
                let permission = await this.permissionRepo.findOne({
                    where: { key: item.key },
                    relations: ['menu']
                });

                // 不存在则新建权限
                if (!permission) {
                    const menu = await this.menuRepo.findOne({
                        where: { name: item.menu }
                    });

                    if (!menu) {
                        console.warn(
                            `菜单 ${item.menu} 不存在，跳过权限 ${item.key}`
                        );
                        continue;
                    }

                    permission = await this.permissionRepo.save({
                        key: item.key,
                        name: item.name,
                        description: item.description,
                        menu
                    });
                }

                // 2. 绑定权限给角色，通过中间表实体手动保存
                if (item.roles?.length) {
                    for (const roleName of item.roles) {
                        const role = await this.roleRepo.findOne({
                            where: { name: roleName }
                        });

                        if (!role) {
                            console.warn(
                                `角色 ${roleName} 不存在，跳过绑定权限 ${item.key}`
                            );
                            continue;
                        }

                        // 检查中间表是否已有绑定，避免重复
                        const exist = await this.rolePermissionRepo.findOne({
                            where: {
                                role,
                                permission
                            }
                        });

                        if (!exist) {
                            await this.rolePermissionRepo.save({
                                role,
                                permission
                            });
                        }
                    }
                }
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async syncAdminPermissions(oldAdminPermissinos: AdminPermission[]) {
        const newPermissions = await this.permissionRepo.find({
            relations: ['menu']
        });

        try {
            for (const item of oldAdminPermissinos) {
                const admin = await this.adminRepo.findOne({
                    where: { id: item.admin.id }
                });
                if (!admin) return;

                const permission = newPermissions.find(
                    (p) => p.menu.name === item.permission.menu.name
                );
                if (!permission) return;

                await this.adminPermissionRepo.save({
                    admin,
                    permission,
                    enabled: item.enabled
                });
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
