import {
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { RoleMenu } from './entity/role_menu.entity';
import { Menu } from './entity/menu.entity';
import { Role } from './entity/role.entity';
import { UpdateRoleMenusDto } from './dto/update-role_menu.dto';
import { Admin } from 'src/admin/entities/admin.entity';
import { RolePermission } from 'src/permission/entity/role_permission.entity';
import { Permission } from 'src/permission/entity/permission.entity';
import { AdminPermission } from 'src/permission/entity/admin_permission.entity';
import { AdminMenu } from './entity/admin_menu.entity';
import { LogService } from 'src/system_log/log.service';
import { RoleType } from './enum/role.enum';
import { Request } from 'express';
import { PermissionService } from 'src/permission/permission.service';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

@Injectable()
export class RoleMenuService {
    constructor(
        @InjectRepository(RoleMenu)
        private readonly roleMenuRepo: Repository<RoleMenu>,
        @InjectRepository(Menu)
        private readonly menuRepo: Repository<Menu>,
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(RolePermission)
        private readonly rolePermissionRepo: Repository<RolePermission>,
        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(AdminPermission)
        private readonly adminPermissionRepo: Repository<AdminPermission>,
        @InjectRepository(AdminMenu)
        private readonly adminMenuRepo: Repository<AdminMenu>,
        private readonly dataSource: DataSource,
        private readonly logService: LogService,
        private readonly permissionService: PermissionService
    ) {}

    // role
    async getRoles(
        page: number,
        limit: number,
        orderBy: string,
        sortBy: string
    ): Promise<{
        data: Role[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const skip = (page - 1) * limit;
        const direction = orderBy.toUpperCase() as 'ASC' | 'DESC';

        const [data, total] = await this.roleRepo
            .createQueryBuilder('role')
            .skip(skip)
            .take(limit)
            .orderBy(`role.${sortBy}`, direction)
            .getManyAndCount();

        const roles = {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit)
        };

        return roles;
    }

    // menu
    async getMenusByPermission(roleId: number) {
        // 查找角色权限
        const rolePermissions = await this.rolePermissionRepo.find({
            where: { role: { id: roleId } },
            relations: ['permission']
        });
        const checkedPermissionIds = rolePermissions.map(
            (rp) => rp.permission.id
        );

        // 查找角色菜单
        const roleMenus = await this.roleMenuRepo.find({
            where: { role: { id: roleId } },
            relations: ['menu']
        });
        const checkedMenuIds = roleMenus.map((rm) => rm.menu.id);

        // 获取所有菜单及权限
        const allMenus = await this.menuRepo.find({
            relations: ['parent', 'permissions'],
            order: { id: 'ASC' }
        });

        const buildTree = (
            menus: Menu[],
            parentId: number | null = null
        ): any[] => {
            return menus
                .filter((m) => (m.parent?.id || null) === parentId)
                .map((menu) => ({
                    id: menu.id,
                    name: menu.name,
                    path: menu.path,
                    icon: menu.icon,
                    permissions: (menu.permissions || []).map((p) => ({
                        id: p.id,
                        key: p.key,
                        name: p.name,
                        description: p.description
                    })),
                    children: buildTree(menus, menu.id)
                }));
        };

        return {
            checkedMenuIds,
            checkedPermissionIds,
            menuData: buildTree(allMenus)
        };
    }

    async getFinalPermission(admin: Admin) {
        // 查找相应的角色权限
        // 最终权限
        const finalPermissions = new Map<string, number>();
        const rolePermissions = await this.rolePermissionRepo.find({
            where: { role: { id: admin.role.id } },
            relations: ['permission']
        });

        // 加入角色权限
        for (const p of rolePermissions) {
            const key = `perm-${p.permission.id}`;
            finalPermissions.set(key, p.permission.id);
        }
        // 合并 adminPermission 修改项
        for (const ap of admin.adminPermissions) {
            if (!ap.permission) {
                // 对应的 permission 被删了，可以跳过或者记录日志
                continue;
            }

            const key = `perm-${ap.permission.id}`;
            if (ap.enabled === false) {
                finalPermissions.delete(key); // 被个人关闭
            } else {
                finalPermissions.set(key, ap.permission.id); // 被个人打开（即使 role 没有）
            }
        }

        return Array.from(finalPermissions.values());
    }

    async getFinalMenus(admin: Admin) {
        // 查找相应的角色菜单
        // 最终菜单
        const finalMenus = new Map<string, number>();
        const roleMenus = await this.roleMenuRepo.find({
            where: { role: { id: admin.role.id } },
            relations: ['menu']
        });
        // 加入角色菜单
        for (const m of roleMenus) {
            const key = `menu-${m.menu.id}`;
            finalMenus.set(key, m.menu.id);
        }

        // 合并 adminMenu
        for (const am of admin.adminMenus) {
            const key = `menu-${am.menu.id}`;
            if (am.enabled === false) {
                finalMenus.delete(key);
            } else {
                finalMenus.set(key, am.menu.id);
            }
        }

        return Array.from(finalMenus.values());
    }

    async getAdminAccess(userId: number) {
        // 查找管理员
        const admin = await this.adminRepo.findOne({
            where: { id: userId },
            relations: [
                'role',
                'adminPermissions',
                'adminPermissions.permission',
                'adminMenus',
                'adminMenus.menu'
            ]
        });
        if (!admin) {
            throw new NotFoundException(`Admin ID ${userId} not found`);
        }

        // 获取所有菜单及权限
        const allMenus = await this.menuRepo.find({
            relations: ['parent', 'permissions'],
            order: { id: 'ASC' }
        });

        const buildTree = (
            menus: Menu[],
            parentId: number | null = null
        ): any[] => {
            return menus
                .filter((m) => (m.parent?.id || null) === parentId)
                .map((menu) => ({
                    id: menu.id,
                    name: menu.name,
                    path: menu.path,
                    icon: menu.icon,
                    permissions: (menu.permissions || []).map((p) => ({
                        id: p.id,
                        key: p.key,
                        name: p.name,
                        description: p.description
                    })),
                    children: buildTree(menus, menu.id)
                }));
        };

        const checkedMenuIds = await this.getFinalMenus(admin);
        const checkedPermissionIds = await this.getFinalPermission(admin);

        return {
            checkedMenuIds,
            checkedPermissionIds,
            menuData: buildTree(allMenus)
        };
    }

    private ROLE_OPTIONS = [
        {
            label: '代理',
            value: RoleType.AGENT
        },
        {
            label: '员工',
            value: RoleType.TEAM
        }
    ];

    async updateAdminAccess(
        adminId: number,
        req: Request,
        targetId: number,
        submittedPermissionIds: number[],
        submittedMenuIds: number[]
    ) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });

        if (!admin || !admin.role)
            throw new NotFoundException('管理员或角色不存在');

        const targetAdmin = await this.adminRepo.findOne({
            where: { id: targetId },
            relations: [
                'role',
                'adminPermissions',
                'adminPermissions.permission',
                'adminMenus',
                'adminMenus.menu'
            ]
        });
        if (!targetAdmin || !targetAdmin.role)
            throw new NotFoundException(`Admin ID ${targetId} not found`);

        const addedPermissions: number[] = [];
        const removedPermissions: number[] = [];

        // role permissions
        const rolePermissions = await this.rolePermissionRepo.find({
            where: { role: { id: targetAdmin.role.id } },
            relations: ['permission']
        });
        const rolePermissionIds = rolePermissions.map((rp) => rp.permission.id);
        const newAdminPermissions: AdminPermission[] = [];

        const allPermissionIds = new Set([
            ...rolePermissionIds,
            ...submittedPermissionIds,
            ...targetAdmin.adminPermissions?.map((ap) => ap.permission.id)
        ]);

        for (const id of allPermissionIds) {
            const hasInRole = rolePermissionIds.includes(id);
            const hasInSubmit = submittedPermissionIds.includes(id);

            // 查找是否已存在
            const existing = targetAdmin.adminPermissions?.find(
                (ap) => ap.permission.id === id
            );

            if (existing) {
                // 数据库已有记录
                if (hasInRole && hasInSubmit) {
                    // 🔄 跟角色一致，存在个性化配置 → 删除个性化记录
                    await this.adminPermissionRepo.remove(existing);
                    removedPermissions.push(id);
                } else if (hasInRole && !hasInSubmit) {
                    // ✅ 角色有但用户取消 → 设置为 disabled
                    if (existing.enabled !== false) {
                        existing.enabled = false;
                        await this.adminPermissionRepo.save(existing);
                        removedPermissions.push(id);
                    }
                } else if (!hasInRole && hasInSubmit) {
                    // ✅ 用户单独勾选 → 设置为 enabled
                    if (existing.enabled !== true) {
                        existing.enabled = true;
                        await this.adminPermissionRepo.save(existing);
                        addedPermissions.push(id);
                    }
                } else if (!hasInRole && !hasInSubmit) {
                    // ❌ 多余权限 → 删除
                    await this.adminPermissionRepo.remove(existing);
                    removedPermissions.push(id);
                }
            } else {
                // 数据库没有记录
                if (hasInRole && !hasInSubmit) {
                    // ✅ 角色有但用户取消 → 创建 disabled 记录
                    newAdminPermissions.push(
                        this.adminPermissionRepo.create({
                            admin: targetAdmin,
                            permission: { id },
                            enabled: false
                        })
                    );
                    addedPermissions.push(id);
                } else if (!hasInRole && hasInSubmit) {
                    // ✅ 用户额外勾选 → 创建 enabled 记录
                    newAdminPermissions.push(
                        this.adminPermissionRepo.create({
                            admin: targetAdmin,
                            permission: { id },
                            enabled: true
                        })
                    );
                    addedPermissions.push(id);
                }
            }
        }

        if (addedPermissions.length > 0 || removedPermissions.length > 0) {
            const affectedIds = [
                ...new Set([...addedPermissions, ...removedPermissions])
            ];

            const permissions = await this.permissionRepo.findBy({
                id: In(affectedIds)
            });
            const permissionLabels = permissions.map((p) => `${p.description}`);

            const addedLabels = permissionLabels.filter((p) =>
                addedPermissions.includes(
                    permissions.find((pp) => `${pp.description}` === p)?.id!
                )
            );

            const removedLabels = permissionLabels.filter((p) =>
                removedPermissions.includes(
                    permissions.find((pp) => `${pp.description}` === p)?.id!
                )
            );

            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '更新权限',
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label ?? '',
                targetId: targetAdmin.id,
                description: `[${admin.name}] 修改了${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }[${targetAdmin.name}]的权限：
                新增了[${addedLabels.join('，')}], 
                移除了[${removedLabels.join('，')}]`
            });
        }

        const addedMenus: number[] = [];
        const removedMenus: number[] = [];

        // menu 权限
        const roleMenus = await this.roleMenuRepo.find({
            where: { role: { id: targetAdmin.role.id } },
            relations: ['menu']
        });
        const roleMenuIds = roleMenus.map((rm) => rm.menu.id);
        const newAdminMenus: AdminMenu[] = [];

        const allMenuIds = new Set([
            ...roleMenuIds,
            ...submittedMenuIds,
            ...targetAdmin.adminMenus?.map((am) => am.menu.id)
        ]);

        for (const id of allMenuIds) {
            const hasInRole = roleMenuIds.includes(id);
            const hasInSubmit = submittedMenuIds.includes(id);

            const existing = targetAdmin.adminMenus?.find(
                (am) => am.menu.id === id
            );
            if (existing) {
                if (hasInRole && hasInSubmit) {
                    // ✅ 和角色一致，无需保留个人记录
                    await this.adminMenuRepo.remove(existing);
                    removedMenus.push(id);
                } else if (hasInRole && !hasInSubmit) {
                    // ✅ 属于角色但用户取消 → 禁用
                    if (existing.enabled !== false) {
                        existing.enabled = false;
                        await this.adminMenuRepo.save(existing);
                        removedMenus.push(id);
                    }
                } else if (!hasInRole && hasInSubmit) {
                    // ✅ 不属于角色但用户勾选 → 启用
                    if (existing.enabled !== true) {
                        existing.enabled = true;
                        await this.adminMenuRepo.save(existing);
                        addedMenus.push(id);
                    }
                } else if (!hasInRole && !hasInSubmit) {
                    // ❌ 多余的 → 删除
                    await this.adminMenuRepo.remove(existing);
                    removedMenus.push(id);
                }
            } else {
                if (hasInRole && !hasInSubmit) {
                    newAdminMenus.push(
                        this.adminMenuRepo.create({
                            admin: targetAdmin,
                            menu: { id },
                            enabled: false
                        })
                    );
                    addedMenus.push(id);
                } else if (!hasInRole && hasInSubmit) {
                    newAdminMenus.push(
                        this.adminMenuRepo.create({
                            admin: targetAdmin,
                            menu: { id },
                            enabled: true
                        })
                    );
                    addedMenus.push(id);
                }
            }
        }

        if (addedMenus.length > 0 || removedMenus.length > 0) {
            const affectedIds = [...new Set([...addedMenus, ...removedMenus])];

            const menus = await this.menuRepo.findBy({
                id: In(affectedIds)
            });
            const menuLabels = menus.map((m) => `${m.name}`);

            const addedLabels = menuLabels.filter((m) =>
                addedMenus.includes(menus.find((mm) => `${mm.name}` === m)?.id!)
            );

            const removedLabels = menuLabels.filter((m) =>
                removedMenus.includes(
                    menus.find((mm) => `${mm.name}` === m)?.id!
                )
            );

            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '更新菜单',
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label ?? '',
                targetId: targetAdmin.id,
                description: `[${admin.name}] 修改了${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }[${targetAdmin.name}]的菜单：
                新增了[${addedLabels.join('，')}], 
                移除了[${removedLabels.join('，')}]`
            });
        }

        // 保存
        if (newAdminPermissions.length > 0) {
            await this.adminPermissionRepo.save(newAdminPermissions);
        }

        if (newAdminMenus.length > 0) {
            await this.adminMenuRepo.save(newAdminMenus);
        }

        return { message: '个性化权限已更新' };
    }

    // role menu
    async getMenus(userId: number): Promise<Menu[]> {
        // 查找管理员
        const admin = await this.adminRepo.findOne({
            where: { id: userId },
            relations: [
                'role',
                'adminMenus',
                'adminMenus.menu',
                'adminPermissions',
                'adminPermissions.permission'
            ]
        });
        if (!admin) {
            throw new NotFoundException(`Admin ID ${userId} not found!`);
        }

        const menuIds = await this.getFinalMenus(admin);
        const permissionIds = await this.getFinalPermission(admin);

        // 查询所有 menu，带 parent 和 children
        const menus = await this.menuRepo.find({
            where: { id: In(menuIds) },
            relations: ['parent', 'permissions'],
            order: { id: 'ASC' }
        });

        // 手动过滤每个 menu 的 permissions，只保留在 permissionIds 内的
        const filteredMenus = menus.map((menu) => {
            const filteredPermissions = menu.permissions?.filter((p) =>
                permissionIds.includes(p.id)
            );
            return {
                ...menu,
                permissions: filteredPermissions
            };
        });

        const buildTree = (
            menus: Menu[],
            parentId: number | null = null
        ): any[] => {
            return menus
                .filter((m) => (m.parent?.id || null) === parentId)
                .map((menu) => ({
                    id: menu.id,
                    name: menu.name,
                    path: menu.path,
                    icon: menu.icon,
                    visible: menu.visible,
                    permissions: (menu.permissions || []).map((p) => ({
                        id: p.id,
                        key: p.key,
                        name: p.name
                    })),
                    children: buildTree(menus, menu.id)
                }));
        };

        return buildTree(filteredMenus);
    }

    async updateMenusByRole(dto: UpdateRoleMenusDto) {
        const role = await this.roleRepo.findOneBy({ id: dto.id });
        if (!role) throw new NotFoundException('角色不存在');

        // 删除旧的权限
        await this.roleMenuRepo.delete({ role: { id: dto.id } });
        await this.rolePermissionRepo.delete({ role: { id: dto.id } });

        // 查询所有对应的菜单
        const menus = await this.menuRepo.findBy({ id: In(dto.menuIds) });

        // 查询所有对应的权限
        const permissions = await this.permissionRepo.findBy({
            id: In(dto.permissionIds)
        });

        // 创建新的 RoleMenu 记录
        const newRoleMenus = menus.map((menu) =>
            this.roleMenuRepo.create({ role, menu })
        );

        // 创建新的 RolePermission 记录
        const newRolePermissions = permissions.map((permission) =>
            this.rolePermissionRepo.create({ role, permission })
        );

        // 保存记录
        await this.roleMenuRepo.save(newRoleMenus);
        await this.rolePermissionRepo.save(newRolePermissions);
    }

    private readonly defaultMenus = [
        {
            name: 'home',
            path: '/dashboard',
            icon: 'home',
            roles: ['admin', 'agent', 'team', 'support', 'head'],
            visible: 1
        },
        {
            name: 'customer.home',
            path: '',
            icon: 'people',
            roles: ['admin', 'agent', 'team', 'support', 'head'],
            visible: 1,
            children: [
                {
                    name: 'customer.list',
                    path: '/customers',
                    icon: '',
                    roles: ['admin', 'agent', 'team', 'support', 'head'],
                    visible: 1
                },
                {
                    name: 'customer.login',
                    path: '/customers/login-activity',
                    icon: '',
                    roles: ['admin', 'agent', 'team', 'support', 'head'],
                    visible: 1
                }
            ]
        },
        {
            name: 'order.home',
            path: '',
            icon: 'receiptlong',
            roles: ['admin', 'agent', 'team', 'support', 'head'],
            visible: 1,
            children: [
                {
                    name: 'order.list',
                    path: '/orders',
                    icon: '',
                    roles: ['admin', 'agent', 'team', 'support', 'head'],
                    visible: 1
                },
                {
                    name: 'order.log',
                    path: '/orders/logs',
                    icon: '',
                    roles: ['admin', 'agent', 'team', 'support', 'head'],
                    visible: 1
                }
            ]
        },
        {
            name: 'marketing.home',
            path: '',
            icon: '',
            roles: ['admin', 'agent'],
            visible: 1,
            children: [
                {
                    name: 'marketing.event',
                    path: '/events',
                    icon: '',
                    roles: ['admin', 'agent'],
                    visible: 1
                },
                {
                    name: 'marketing.wheel',
                    path: '/lucky-wheels',
                    icon: '',
                    roles: ['admin', 'agent'],
                    visible: 1
                }
            ]
        },
        {
            name: 'product.home',
            path: '',
            icon: 'inventory',
            roles: ['admin', 'agent'],
            visible: 1,
            children: [
                {
                    name: 'product.list',
                    path: '/products',
                    icon: '',
                    roles: ['admin', 'agent'],
                    visible: 1
                },
                {
                    name: 'product.category',
                    path: '/categories',
                    icon: '',
                    roles: ['admin', 'agent'],
                    visible: 1
                }
            ]
        },
        {
            name: 'message.list',
            path: '/messages',
            icon: 'chatbubbleoutline',
            roles: ['admin', 'agent', 'support'],
            visible: 1
        },
        {
            name: 'admin.home',
            path: '',
            icon: 'adminpanelsettings',
            roles: ['admin'],
            visible: 1,
            children: [
                {
                    name: 'admin.list',
                    path: '/admins',
                    icon: '',
                    roles: ['admin'],
                    visible: 1
                },
                {
                    name: 'admin.login',
                    path: '/admins/login-activity',
                    icon: '',
                    roles: ['admin'],
                    visible: 1
                }
            ]
        },
        {
            name: 'finance.home',
            path: '',
            icon: 'summarize',
            roles: ['admin', 'support'],
            visible: 1,
            children: [
                {
                    name: 'finance.order',
                    path: '/finance/order-payment',
                    icon: '',
                    roles: ['admin', 'support'],
                    visible: 1
                },
                {
                    name: 'finance.deposit',
                    path: '/finance/deposit',
                    icon: '',
                    roles: ['admin', 'support'],
                    visible: 1
                }
            ]
        },
        {
            name: 'setting.home',
            path: '',
            icon: 'settings',
            roles: ['admin', 'agent'],
            visible: 1,
            children: [
                {
                    name: 'setting.site',
                    path: '/settings/site',
                    icon: '',
                    roles: ['admin', 'agent'],
                    visible: 1
                },
                {
                    name: 'setting.delivery',
                    path: '/settings/delivery',
                    icon: '', // localshipping
                    roles: ['admin', 'agent'],
                    visible: 1
                },
                {
                    name: 'setting.payment',
                    path: '/settings/payment',
                    icon: '',
                    roles: ['admin', 'agent'],
                    visible: 1
                },
                {
                    name: 'setting.role',
                    path: '/settings/roles',
                    icon: '', // gppgood
                    roles: ['admin'],
                    visible: 1
                },
                {
                    name: 'setting.maintenance',
                    path: '/settings/maintenance',
                    icon: '',
                    roles: ['admin'],
                    visible: 1
                },
                {
                    name: 'setting.integrations',
                    path: '/settings/integrations',
                    icon: '',
                    roles: ['admin'],
                    visible: 1
                },
                {
                    name: 'setting.log',
                    path: '/settings/logs',
                    icon: '',
                    roles: ['admin'],
                    visible: 1
                }
            ]
        }
    ];

    async reset(req: Request, adminId: number) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        // 1. 备份旧的管理员菜单 path
        const adminMenus = await this.adminMenuRepo.find({
            relations: ['admin', 'menu']
        });

        await this.dataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 0`);
        await this.dataSource.manager.query(`TRUNCATE TABLE role_menus`);
        await this.dataSource.manager.query(`TRUNCATE TABLE menus`);
        await this.dataSource.manager.query(`TRUNCATE TABLE roles`);
        await this.dataSource.manager.query(`TRUNCATE TABLE admin_menus`);
        await this.dataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 1`);

        // 2. 重新初始化
        await this.seedRoles();
        await this.seedMenusAndRoleMenus();

        // 3. 同步管理员菜单权限
        await this.syncAdminMenus(adminMenus);

        await this.logService.logAdminAction(req, {
            adminId: admin.id,
            userType: UserType.ADMIN,
            action: '重置菜单',
            targetType: '菜单',
            description: `[${admin.name}] 重置了角色菜单数据，默认菜单数据，角色数据，管理员菜单数据。`
        });

        // 4. 菜单id改变也需要重新同步权限id
        await this.permissionService.reset(req, adminId);
    }

    async seedRoles() {
        const defaultRoles = [
            { name: 'admin', description: '管理员' },
            { name: 'agent', description: '代理' },
            { name: 'team', description: '组员' },
            { name: 'customer', description: '客户' },
            { name: 'support', description: '客服' },
            { name: 'head', description: '团长' }
        ];

        try {
            for (const role of defaultRoles) {
                const roleExists = await this.roleRepo.findOne({
                    where: { name: role.name }
                });
                if (!roleExists) {
                    await this.roleRepo.save(role);
                }
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async seedMenusAndRoleMenus() {
        const roleMap = new Map<string, Role>();
        const allRoles = await this.roleRepo.find();
        allRoles.forEach((role) => roleMap.set(role.name, role));

        const allMenus: Menu[] = [];
        const allRoleMenus: RoleMenu[] = [];

        try {
            const insertMenu = async (
                menuItem: any,
                parent: Menu | undefined = undefined
            ): Promise<Menu> => {
                const menu = this.menuRepo.create({
                    name: menuItem.name,
                    path: menuItem.path,
                    icon: menuItem.icon,
                    visible: menuItem.visible,
                    parent
                });

                const savedMenu = await this.menuRepo.save(menu);
                allMenus.push(savedMenu);

                // 分配权限
                for (const roleName of menuItem.roles ?? []) {
                    const role = roleMap.get(roleName);
                    if (role) {
                        const roleMenu = this.roleMenuRepo.create({
                            role,
                            menu: savedMenu
                        });
                        allRoleMenus.push(roleMenu);
                    }
                }

                // 递归插入子菜单
                if (menuItem.children?.length) {
                    for (const child of menuItem.children) {
                        await insertMenu(child, savedMenu);
                    }
                }

                return savedMenu;
            };

            // 启动插入
            for (const item of this.defaultMenus) {
                await insertMenu(item);
            }

            // 批量保存角色菜单关系
            await this.roleMenuRepo.save(allRoleMenus);
            console.log('✅ 默认菜单和权限初始化完成');
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async syncAdminMenus(oldAdminMenus: AdminMenu[]) {
        try {
            for (const item of oldAdminMenus) {
                const admin = await this.adminRepo.findOne({
                    where: { id: item.admin.id }
                });
                if (!admin) return;

                const menu = await this.menuRepo.findOne({
                    where: { name: item.menu.name }
                });
                if (!menu) return;

                await this.adminMenuRepo.save({
                    admin,
                    menu,
                    enabled: item.enabled
                });
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
