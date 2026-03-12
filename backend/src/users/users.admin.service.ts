import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { Between, DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { RoleType } from 'src/role/enum/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UtilityService } from 'src/utility/utility.service';
import { UserMode } from './enum/user.enum';
import { Role } from 'src/role/entity/role.entity';
import { LogService } from 'src/system_log/log.service';
import { AdminService } from 'src/admin/admin.service';
import { Request } from 'express';
import { SearchUserDto } from './dto/search-user.dto';
import { PaymentStatus } from 'src/orders/enums/order.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';

@Injectable()
export class AdminUserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        private readonly utilityService: UtilityService,
        private readonly logService: LogService,
        private readonly adminService: AdminService,
        private readonly dataSource: DataSource,
        private readonly notiService: NotificationService
    ) {}

    async getOverviewData(admin: Admin) {
        // 总客户数
        let totalCustomers = 0;
        if (admin.role.name === RoleType.ADMIN) {
            totalCustomers = await this.userRepo.count({
                where: { mode: UserMode.LIVE }
            });
        }

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                relations: ['role', 'parent']
            });

            const teamIds = teams.map((t) => t.id);
            totalCustomers = await this.userRepo.count({
                where: { parent: { id: In(teamIds) }, mode: UserMode.LIVE },
                relations: ['parent']
            });
        }

        if (admin.role.name === RoleType.TEAM) {
            totalCustomers = await this.userRepo.count({
                where: { parent: { id: admin.id }, mode: UserMode.LIVE },
                relations: ['parent']
            });
        }

        // 新客户（本月注册）
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        let newCustomers = 0;
        if (admin.role.name === RoleType.ADMIN) {
            newCustomers = await this.userRepo.count({
                where: {
                    mode: UserMode.LIVE,
                    createdAt: Between(startOfMonth, endOfMonth)
                }
            });
        }

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                relations: ['role', 'parent']
            });

            const teamIds = teams.map((t) => t.id);

            newCustomers = await this.userRepo.count({
                where: {
                    parent: { id: In(teamIds) },
                    mode: UserMode.LIVE,
                    createdAt: Between(startOfMonth, endOfMonth)
                }
            });
        }

        if (admin.role.name === RoleType.TEAM) {
            newCustomers = await this.userRepo.count({
                where: {
                    parent: { id: admin.id },
                    mode: UserMode.LIVE,
                    createdAt: Between(startOfMonth, endOfMonth)
                }
            });
        }

        // 活跃客户（30天内有下单/登录）
        const date30DaysAgo = new Date();
        date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

        let activeCustomerCount = 0;
        let activeQuery = this.userRepo
            .createQueryBuilder('user')
            .innerJoin('user.orders', 'order')
            .where('user.mode = :mode', { mode: UserMode.LIVE })
            .andWhere('order.createdAt >= :date', { date: date30DaysAgo });

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                relations: ['role', 'parent']
            });

            const teamIds = teams.map((t) => t.id);
            activeQuery.andWhere('user.parentId IN (:...teamIds)', { teamIds });
        }

        if (admin.role.name === RoleType.TEAM) {
            activeQuery.andWhere('user.parentId = :parentId', {
                parentId: admin.id
            });
        }

        activeCustomerCount = await activeQuery
            .select('user.id')
            .groupBy('user.id')
            .getCount();

        // 高价值客户（消费 ≥ 100€）
        // 统计近30天消费 ≥ 100 的客户数量
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 30);

        let highValueCustomerCount = 0;
        let highQuery = this.userRepo
            .createQueryBuilder('user')
            .innerJoin('user.orders', 'order')
            .where('user.mode = :mode', { mode: UserMode.LIVE })
            .andWhere('order.createdAt >= :recentDate', { recentDate })
            .andWhere('order.paymentStatus = :status', {
                status: PaymentStatus.PAID
            });

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                relations: ['role', 'parent']
            });

            const teamIds = teams.map((t) => t.id);
            highQuery.andWhere('user.parentId IN (:...teamIds)', { teamIds });
        }

        if (admin.role.name === RoleType.TEAM) {
            highQuery.andWhere('user.parentId = :parentId', {
                parentId: admin.id
            });
        }

        highValueCustomerCount = await highQuery
            .groupBy('user.id')
            .having(
                'SUM(CAST(order.payAmount AS DECIMAL(10,2))) >= :minSpend',
                { minSpend: 100 }
            )
            .getCount();

        const overview = {
            totalCustomers,
            newCustomers,
            activeCustomers: activeCustomerCount,
            highValueCustomers: highValueCustomerCount
        };

        return overview;
    }

    async getAll(adminId: number, dto: SearchUserDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });
        if (!admin) {
            throw new NotFoundException('Invalid User ID');
        }

        const skip = (dto.page - 1) * dto.limit;
        const query = this.userRepo
            .createQueryBuilder('user')
            .leftJoin('user.parent', 'parent')
            .leftJoin('user.orders', 'order')
            .select([
                'user.id',
                'user.avatar',
                'user.name',
                'user.email',
                'user.phone',
                'user.status',
                'user.balance',
                'user.remark',
                'user.parentId',
                'user.ip',
                'user.loginIp',
                'user.city',
                'user.state',
                'user.zipCode',
                'user.country',
                'user.updatedAt',
                'user.createdAt',
                'user.emailVerified',
                'user.mode',
                'user.lastLoginAt',
                'user.point',
                'parent.id',
                'parent.name',
                'parent.referralCode',
                'order.id'
            ]);

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        if (admin.role.name === RoleType.AGENT) {
            // 1. Agent 自己
            const ids = [admin.id];

            // 2. Agent 直属的 Head
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });
            const headIds = heads.map((h) => h.id);
            ids.push(...headIds);

            // 3. Agent 直属的 Team（不经过 Head）
            const directTeams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });
            const directTeamIds = directTeams.map((t) => t.id);
            ids.push(...directTeamIds);

            // 4. Head 下面的 Team
            if (headIds.length > 0) {
                const headTeams = await this.adminRepo.find({
                    where: {
                        parent: { id: In(headIds) },
                        role: { name: RoleType.TEAM }
                    },
                    select: ['id']
                });
                ids.push(...headTeams.map((t) => t.id));
            }

            // 5. 过滤重复
            const uniqueIds = Array.from(new Set(ids));

            // 6. 查询所有 user
            query.andWhere('user.parentId IN (:...ids)', { ids: uniqueIds });
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            if (teamIds.length > 0) {
                query.andWhere('user.parentId IN (:...ids)', {
                    ids: [admin.id, ...teamIds]
                });
            } else {
                query.andWhere('1=0'); // 无结果
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            query.andWhere('user.parentId = :parentId', {
                parentId: admin.id
            });
        }

        // 精准过滤字段
        if (dto.userId)
            query.andWhere('user.id = :userId', { userId: dto.userId });
        if (dto.name)
            query.andWhere('user.name LIKE :name', { name: `%${dto.name}%` });
        if (dto.email)
            query.andWhere('user.email LIKE :email', {
                email: `%${dto.email}%`
            });
        if (dto.phone)
            query.andWhere('user.phone LIKE :phone', {
                phone: `%${dto.phone}%`
            });
        if (dto.remark)
            query.andWhere('user.remark LIKE :remark', {
                remark: `%${dto.remark}%`
            });
        if (dto.status !== undefined)
            query.andWhere('user.status = :status', {
                status: dto.status === 1
            });
        if (dto.mode !== undefined)
            query.andWhere('user.mode = :mode', { mode: dto.mode });
        if (dto.parentId !== undefined)
            query.andWhere('parent.id = :parentId', { parentId: dto.parentId });
        // 金额区间（假设 user.balance 字段为 number）
        if (dto.balanceGreaterThan)
            query.andWhere('user.balance >= :balanceGreaterThan', {
                balanceGreaterThan: parseFloat(dto.balanceGreaterThan)
            });
        if (dto.balanceLessThan)
            query.andWhere('user.balance <= :balanceLessThan', {
                balanceLessThan: parseFloat(dto.balanceLessThan)
            });
        // 时间范围（假设 user.createdAt）
        if (dto.fromDate)
            query.andWhere('user.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('user.createdAt <= :toDate', { toDate: dto.toDate });
        // 订单搜索
        if (dto.hasOrder)
            query.andWhere('order.createdAt >= :date', { date: dto.cusDate });

        if (dto.hasValue) {
            query
                .andWhere('order.createdAt >= :recentDate', {
                    recentDate: dto.cusDate
                })
                .andWhere('order.paymentStatus = :status', {
                    status: PaymentStatus.PAID
                })
                .groupBy('user.id')
                .having(
                    'SUM(CAST(order.payAmount AS DECIMAL(10,2))) >= :minSpend',
                    { minSpend: 100 }
                );
        }

        const sortFieldMap = {
            actions: 'user.id',
            'parent.name': 'parent.name',
            totalOrders: 'totalOrders',
            totalRevenue: 'totalRevenue'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `user.${dto.sortBy}`;

        const [rawAndEntities, total] = await Promise.all([
            query
                .addSelect(
                    `COUNT(CASE WHEN order.paymentStatus = '${PaymentStatus.PAID}' THEN 1 END)`,
                    'totalOrders'
                )
                .addSelect(
                    `SUM(CASE WHEN order.paymentStatus = '${PaymentStatus.PAID}' THEN order.payAmount ELSE 0 END)`,
                    'totalRevenue'
                )
                .groupBy('user.id')
                .skip(skip)
                .take(dto.limit)
                .orderBy(sortField, direction)
                .getRawAndEntities(),

            query.getCount()
        ]);

        // 把统计结果合并到用户实体里
        const data = rawAndEntities.entities.map((user, idx) => ({
            ...user,
            totalOrders: Number(rawAndEntities.raw[idx].totalOrders) || 0,
            totalRevenue: Number(rawAndEntities.raw[idx].totalRevenue) || 0
        }));

        const users = {
            overview: await this.getOverviewData(admin),
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        await this.adminService.updateLastLogin(admin.id);

        return users;
    }

    async update(adminId: number, req: Request, dto: UpdateUserDto) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        const user = await this.userRepo.findOne({
            where: { id: dto.id },
            relations: ['parent']
        });

        if (!user) throw new NotFoundException('User not found');

        if (user.name !== dto.name && dto.name !== undefined) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新名称',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的名称：'${user.name}' -> '${dto.name}'`
            });
        }

        if (user.email !== dto.email && dto.email !== undefined) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新邮箱',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的邮箱：'${user.email}' -> '${dto.email}'`
            });
        }

        if (user.phone !== dto.phone && dto.phone !== undefined) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新号码',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的电话号码：'${user.phone}' -> '${dto.phone}'`
            });
        }

        if (user.status !== dto.status && dto.status !== undefined) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新状态',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的状态：'${user.status ? '启用' : '禁用'}' -> '${dto.status ? '启用' : '禁用'}'`
            });
        }

        if (user.remark !== dto.remark && dto.remark !== undefined) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新备注',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的备注：'${user.remark}' -> '${dto.remark}'`
            });
        }

        if (user.parent?.id !== dto.parentId && dto.parentId !== undefined) {
            const parent = await this.adminRepo.findOneBy({ id: dto.parentId });

            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新上级',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的上级：'${user.parent?.name}' -> '${parent?.name}'`
            });

            user.parent = parent;
        }

        if (user.mode !== dto.mode && dto.mode !== undefined) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新类型',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的账号类型：'${user.mode === UserMode.LIVE ? '正式' : '试玩'}' -> '${dto.mode === UserMode.LIVE ? '正式' : '试玩'}'`
            });
        }

        if (user.balance !== dto.balance && dto.balance !== undefined) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新余额',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的余额：'${user.balance}' -> '${dto.balance}'`
            });
        }

        if (user.point !== dto.point && dto.point !== undefined) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新积分',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的积分：'${user.point}' -> '${dto.point}'`
            });
        }

        await this.adminService.updateLastLogin(admin.id);
        await this.notiService.sendNotification({
            title: '更新客户',
            userId: admin.id,
            content: `${admin.name} 更新了 客户 ${user.name} 的信息`,
            type: NotificationType.USER,
            path: '/customers',
            createdAt: new Date(),
            targetId: user.id,
            userType: UserType.ADMIN,
            enableNoti: 0
        });

        Object.assign(user, dto);
        await this.userRepo.save(user);
    }

    async create(adminId: number, req: Request, dto: CreateUserDto) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        // Check if email already exists
        const existingUserByEmail = await this.userRepo.findOne({
            where: { email: dto.email }
        });
        if (existingUserByEmail) {
            throw new ConflictException('Email already exists');
        }

        // Check if phone already exists
        const existingUserByPhone = await this.userRepo.findOne({
            where: { phone: dto.phone }
        });
        if (existingUserByPhone) {
            throw new ConflictException('Phone number already exists');
        }

        // Verify the referral code is valid (from an admin)
        try {
            const qb = this.adminRepo
                .createQueryBuilder('admin')
                .leftJoin('admin.role', 'role')
                .where('role.name = :roleName', { roleName: RoleType.TEAM });

            if (dto.referralCode !== undefined && dto.referralCode !== null) {
                qb.andWhere('admin.referralCode = :referralCode', {
                    referralCode: dto.referralCode
                });
            } else {
                qb.andWhere('admin.referralCode IS NULL');
            }

            const parent = await qb.getOne();

            // Hash the password
            const hashedPassword = await this.utilityService.hashPassword(
                dto.password
            );

            const role = await this.roleRepo.findOneBy({
                name: RoleType.CUSTOMER
            });
            if (!role) {
                throw new NotFoundException('Role not found');
            }

            // Create user with hashed password and set parent ID to the admin ID
            let user = this.userRepo.create({
                ...dto,
                password: hashedPassword,
                role,
                parent
            });

            user = await this.userRepo.save(user);
            await this.adminService.updateLastLogin(admin.id);
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '创建客户',
                targetType: '客户',
                targetId: user.id,
                description: `[${admin.name}] 创建了新${user.mode === UserMode.LIVE ? '正式' : '试玩'}客户：'${user.name}'`
            });
            await this.notiService.sendNotification({
                title: '创建客户',
                content: `${admin.name} 创建了 客户[ID: ${user.id}/${user.name}]`,
                type: NotificationType.USER,
                path: '/customers',
                createdAt: new Date(),
                userId: admin.id,
                targetId: user.id,
                userType: UserType.ADMIN,
                enableNoti: 0
            });
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(
                'Error verifying referral code: ' + error.message
            );
        }
    }

    async changePassword(adminId: number, req: Request, dto: UpdateUserDto) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const user = await this.userRepo.findOneBy({ id: dto.id });
        if (!user) throw new NotFoundException(`User ID ${dto.id} not found!`);

        if (!dto.password)
            throw new UnauthorizedException('Missing required fields');

        await this.logService.logAdminAction(req, {
            adminId,
            userType: UserType.ADMIN,
            action: '更新密码',
            targetType: '客户',
            targetId: user.id,
            description: `[${admin.name}] 修改了客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的密码。`
        });

        await this.adminService.updateLastLogin(admin.id);

        const hashed = await this.utilityService.hashPassword(dto.password);
        user.password = hashed;
        await this.userRepo.save(user);
    }

    async delete(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const user = await this.userRepo.findOneBy({ id });
            if (!user) throw new NotFoundException(`User ID ${id} not found!`);

            user.status = false;
            await this.userRepo.save(user);
            await this.userRepo.softDelete(id);
            await this.adminService.updateLastLogin(admin.id);

            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '软删除客户',
                targetType: '客户',
                targetId: id,
                description: `[${admin.name}] 软删除了该客户：${user.name}`
            });
            await this.notiService.sendNotification({
                title: '删除客户',
                content: `${admin.name} 删除了 客户[ID: ${user.id}/${user.name}]`,
                type: NotificationType.USER,
                path: '/customers',
                createdAt: new Date(),
                userId: admin.id,
                targetId: user.id,
                userType: UserType.ADMIN,
                enableNoti: 0
            });
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async getDeletedOverviewData(admin: Admin) {
        // 总客户数
        let totalDeletedCustomers = 0;
        if (admin.role.name === RoleType.ADMIN) {
            totalDeletedCustomers = await this.userRepo.count({
                withDeleted: true,
                where: { mode: UserMode.LIVE, deletedAt: Not(IsNull()) }
            });
        }

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                withDeleted: true,
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                relations: ['role', 'parent']
            });

            const teamIds = teams.map((t) => t.id);
            totalDeletedCustomers = await this.userRepo.count({
                withDeleted: true,
                where: {
                    parent: { id: In(teamIds) },
                    mode: UserMode.LIVE,
                    deletedAt: Not(IsNull())
                },
                relations: ['parent']
            });
        }

        if (admin.role.name === RoleType.TEAM) {
            totalDeletedCustomers = await this.userRepo.count({
                withDeleted: true,
                where: {
                    parent: { id: admin.id },
                    mode: UserMode.LIVE,
                    deletedAt: Not(IsNull())
                },
                relations: ['parent']
            });
        }

        // 客户（本月删除）
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        let oldCustomers = 0;
        if (admin.role.name === RoleType.ADMIN) {
            oldCustomers = await this.userRepo.count({
                withDeleted: true,
                where: {
                    mode: UserMode.LIVE,
                    deletedAt: Between(startOfMonth, endOfMonth)
                }
            });
        }

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                relations: ['role', 'parent']
            });

            const teamIds = teams.map((t) => t.id);

            oldCustomers = await this.userRepo.count({
                withDeleted: true,
                where: {
                    parent: { id: In(teamIds) },
                    mode: UserMode.LIVE,
                    deletedAt: Between(startOfMonth, endOfMonth)
                }
            });
        }

        if (admin.role.name === RoleType.TEAM) {
            oldCustomers = await this.userRepo.count({
                withDeleted: true,
                where: {
                    parent: { id: admin.id },
                    mode: UserMode.LIVE,
                    deletedAt: Between(startOfMonth, endOfMonth)
                }
            });
        }

        const overview = {
            totalDeletedCustomers,
            oldCustomers
        };

        return overview;
    }

    async getDeleted(adminId: number, dto: SearchUserDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });
        if (!admin) {
            throw new NotFoundException('Invalid User ID');
        }

        const skip = (dto.page - 1) * dto.limit;
        const query = this.userRepo
            .createQueryBuilder('user')
            .leftJoin('user.parent', 'parent')
            .leftJoin('user.orders', 'order')
            .select([
                'user.id',
                'user.avatar',
                'user.name',
                'user.email',
                'user.phone',
                'user.status',
                'user.balance',
                'user.remark',
                'user.parentId',
                'user.ip',
                'user.loginIp',
                'user.city',
                'user.state',
                'user.zipCode',
                'user.country',
                'user.createdAt',
                'user.emailVerified',
                'user.mode',
                'user.lastLoginAt',
                'user.deletedAt',
                'user.point',
                'parent.id',
                'parent.name',
                'parent.referralCode',
                'order.id'
            ])
            .withDeleted()
            .andWhere('user.deletedAt IS NOT NULL');

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        if (admin.role.name === RoleType.AGENT) {
            // 1. Agent 自己
            const ids = [admin.id];

            // 2. Agent 直属的 Head
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });
            const headIds = heads.map((h) => h.id);
            ids.push(...headIds);

            // 3. Agent 直属的 Team（不经过 Head）
            const directTeams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });
            const directTeamIds = directTeams.map((t) => t.id);
            ids.push(...directTeamIds);

            // 4. Head 下面的 Team
            if (headIds.length > 0) {
                const headTeams = await this.adminRepo.find({
                    where: {
                        parent: { id: In(headIds) },
                        role: { name: RoleType.TEAM }
                    },
                    select: ['id']
                });
                ids.push(...headTeams.map((t) => t.id));
            }

            // 5. 过滤重复
            const uniqueIds = Array.from(new Set(ids));

            // 6. 查询所有 user
            query.andWhere('user.parentId IN (:...ids)', { ids: uniqueIds });
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            if (teamIds.length > 0) {
                query.andWhere('user.parentId IN (:...ids)', {
                    ids: [admin.id, ...teamIds]
                });
            } else {
                query.andWhere('1=0'); // 无结果
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            query.andWhere('user.parentId = :parentId', {
                parentId: admin.id
            });
        }

        // 精准过滤字段
        if (dto.userId)
            query.andWhere('user.id = :userId', { userId: dto.userId });
        if (dto.name)
            query.andWhere('user.name LIKE :name', { name: `%${dto.name}%` });
        if (dto.email)
            query.andWhere('user.email LIKE :email', {
                email: `%${dto.email}%`
            });
        if (dto.phone)
            query.andWhere('user.phone LIKE :phone', {
                phone: `%${dto.phone}%`
            });
        if (dto.remark)
            query.andWhere('user.remark LIKE :remark', {
                remark: `%${dto.remark}%`
            });
        if (dto.status !== undefined)
            query.andWhere('user.status = :status', {
                status: dto.status === 1
            });
        if (dto.mode !== undefined)
            query.andWhere('user.mode = :mode', { mode: dto.mode });
        if (dto.parentId !== undefined)
            query.andWhere('parent.id = :parentId', { parentId: dto.parentId });
        // 金额区间（假设 user.balance 字段为 number）
        if (dto.balanceGreaterThan)
            query.andWhere('user.balance >= :balanceGreaterThan', {
                balanceGreaterThan: parseFloat(dto.balanceGreaterThan)
            });
        if (dto.balanceLessThan)
            query.andWhere('user.balance <= :balanceLessThan', {
                balanceLessThan: parseFloat(dto.balanceLessThan)
            });
        // 时间范围（假设 user.deletedAt
        if (dto.fromDate)
            query.andWhere('user.deletedAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('user.deletedAt <= :toDate', { toDate: dto.toDate });

        const sortFieldMap = {
            actions: 'user.id',
            'parent.name': 'parent.name'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `user.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const users = {
            overview: await this.getDeletedOverviewData(admin),
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        await this.adminService.updateLastLogin(admin.id);

        return users;
    }

    async restore(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const deleted = await this.userRepo.findOne({
                where: { id },
                withDeleted: true
            });
            if (!deleted)
                throw new NotFoundException(`Deleted User ID ${id} not found!`);

            await this.userRepo.restore(id);
            await this.adminService.updateLastLogin(admin.id);
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '恢复客户',
                targetType: '客户',
                targetId: id,
                description: `[${admin.name}] 恢复了该客户：${deleted.name}`
            });
            await this.notiService.sendNotification({
                title: '恢复客户',
                content: `${admin.name} 恢复了 客户[ID: ${deleted.id}/${deleted.name}]`,
                type: NotificationType.USER,
                path: '/customers',
                createdAt: new Date(),
                userId: admin.id,
                targetId: deleted.id,
                userType: UserType.ADMIN,
                enableNoti: 0
            });
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message);
        } finally {
            await queryRunner.release();
        }
    }
}
