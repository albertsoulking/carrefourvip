import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
    ForbiddenException,
    UnauthorizedException,
    Inject,
    forwardRef
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, MoreThan, Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UtilityService } from 'src/utility/utility.service';
import { Role } from 'src/role/entity/role.entity';
import { RoleType } from 'src/role/enum/role.enum';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import { UserMode } from 'src/users/enum/user.enum';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { SearchAdminDto } from './dto/search-admin.dto';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @Inject(forwardRef(() => UtilityService))
        private readonly utilityService: UtilityService,
        private readonly logService: LogService,
        private readonly dataSource: DataSource,
        private readonly notiService: NotificationService
    ) {}

    private ROLE_OPTIONS = [
        {
            label: '管理员',
            value: RoleType.ADMIN
        },
        {
            label: '代理',
            value: RoleType.AGENT
        },
        {
            label: '组员',
            value: RoleType.TEAM
        },
        {
            label: '客服',
            value: RoleType.SUPPORT
        },
        {
            label: '团长',
            value: RoleType.HEAD
        }
    ];

    // Helper function to generate a random referral code
    private generateReferralCode(length: number = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Helper function to check if referral code already exists
    private async isReferralCodeUnique(code: string): Promise<boolean> {
        const admin = await this.adminRepo.findOne({
            where: { referralCode: code }
        });
        return !admin;
    }

    // Helper function to get a unique referral code
    private async getUniqueReferralCode(): Promise<string> {
        let code = this.generateReferralCode();
        let isUnique = await this.isReferralCodeUnique(code);

        // If code already exists, keep generating until we find a unique one
        while (!isUnique) {
            code = this.generateReferralCode();
            isUnique = await this.isReferralCodeUnique(code);
        }

        return code;
    }

    async create(
        adminId: number,
        req: Request,
        createAdminDto: CreateAdminDto
    ): Promise<Admin> {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} Not Found!`);

        // check if referral code is empty
        if (
            createAdminDto.roleName === RoleType.TEAM &&
            !createAdminDto.referralCode
        ) {
            throw new BadRequestException('Referral Code Should Not Be Empty');
        }

        // Check if email already exists
        const existingAdmin = await this.adminRepo.findOne({
            where: { email: createAdminDto.email }
        });
        if (existingAdmin) {
            throw new ConflictException('Account Already Exists');
        }

        // Hash the password
        const hashedPassword = await this.utilityService.hashPassword(
            createAdminDto.password
        );

        // Generate a unique referral code if one is not provided
        const referralCode = await this.getUniqueReferralCode();

        // Get parant
        const parentAdmin = await this.adminRepo.findOne({
            where: { referralCode: createAdminDto.referralCode }
        });

        // super admin
        const superAdmin = await this.adminRepo.findOne({
            where: { id: 1 }
        });

        // get role
        const roleAdmin = await this.roleRepo.findOne({
            where: { name: createAdminDto.roleName }
        });
        if (!roleAdmin) {
            throw new NotFoundException('Role not found');
        }

        // Create admin with hashed password and referral code
        let targetAdmin = this.adminRepo.create({
            name: createAdminDto.name,
            email: createAdminDto.email,
            password: hashedPassword,
            referralCode,
            parent: parentAdmin ?? superAdmin ?? undefined,
            role: roleAdmin
        });

        targetAdmin = await this.adminRepo.save(targetAdmin);
        await this.logService.logAdminAction(req, {
            adminId,
            userType: UserType.ADMIN,
            action: '创建管理员',
            targetType:
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label ?? '',
            targetId: targetAdmin.id,
            description: `[${admin.name}] 创建了新${
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label
            }[${targetAdmin.name}]管理员：'${targetAdmin.name}'`
        });
        await this.notiService.sendNotification({
            title: `创建管理员 ${
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label
            }`,
            content: `${admin.name} 创建了 管理员 [${targetAdmin.name}]`,
            type: NotificationType.ADMIN,
            path: '/admins',
            createdAt: new Date(),
            userId: admin.id,
            targetId: targetAdmin.id,
            userType: UserType.ADMIN,
            enableNoti: 0
        });

        return targetAdmin;
    }

    async getOverviewData(admin: Admin, roleName: RoleType) {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 30);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        // 总人数
        let totalAdmins = 0;
        if (admin.role.name === RoleType.ADMIN) {
            totalAdmins = await this.adminRepo.count({
                where: { role: { name: roleName } }
            });
        }

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                where: { parent: { id: admin.id }, role: { name: roleName } },
                relations: ['parent']
            });
            const teamIds = teams.map((t) => t.id);
            totalAdmins = await this.adminRepo.count({
                where: { id: In(teamIds), role: { name: roleName } }
            });
        }

        // 活跃人数
        let activeAdmins = 0;
        if (admin.role.name === RoleType.ADMIN) {
            activeAdmins = await this.adminRepo.count({
                where: {
                    role: { name: roleName },
                    lastLoginAt: MoreThan(recentDate)
                }
            });
        }

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                where: { parent: { id: admin.id }, role: { name: roleName } },
                relations: ['parent']
            });
            const teamIds = teams.map((t) => t.id);
            activeAdmins = await this.adminRepo.count({
                where: {
                    id: In(teamIds),
                    role: { name: roleName },
                    lastLoginAt: MoreThan(recentDate)
                }
            });
        }

        // 本月新增
        let newAdmins = 0;
        if (admin.role.name === RoleType.ADMIN) {
            newAdmins = await this.adminRepo.count({
                where: {
                    role: { name: roleName },
                    createdAt: Between(startOfMonth, endOfMonth)
                }
            });
        }

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                where: { parent: { id: admin.id }, role: { name: roleName } },
                relations: ['parent']
            });
            const teamIds = teams.map((t) => t.id);
            await this.adminRepo.count({
                where: {
                    id: In(teamIds),
                    role: { name: roleName },
                    createdAt: Between(startOfMonth, endOfMonth)
                }
            });
        }

        // 示例：找出创建最早的 Agent（或你可以改为 "最多创建用户"）
        const topUser = await this.orderRepo
            .createQueryBuilder('order')
            .innerJoin('order.user', 'user')
            .select('user.id', 'userId')
            .addSelect('COUNT(order.id)', 'orderCount')
            .where('user.mode = :mode', { mode: UserMode.LIVE })
            .groupBy('user.id')
            .orderBy('orderCount', 'DESC')
            .limit(1)
            .getRawOne();

        const user = await this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.parent', 'team')
            .leftJoinAndSelect('team.parent', 'agent')
            .where('user.id = :id', { id: topUser.userId })
            .getOne();

        // 最大团队（成员最多）
        let topTeam: any = undefined;
        let topQuery = this.userRepo
            .createQueryBuilder('user')
            .select('user.parent', 'adminId')
            .addSelect('COUNT(user.id)', 'userCount')
            .innerJoin('user.parent', 'admin')
            .innerJoin('admin.role', 'role')
            .where('role.name = :role', { role: roleName });

        if (admin.role.name === RoleType.AGENT) {
            const teams = await this.adminRepo.find({
                where: { parent: { id: admin.id }, role: { name: roleName } },
                relations: ['parent']
            });
            const teamIds = teams.map((t) => t.id);
            topQuery.andWhere('user.parent IN (:...teamIds)', { teamIds });
        }

        topTeam = await topQuery
            .groupBy('user.parent')
            .orderBy('userCount', 'DESC')
            .limit(1)
            .setParameters({ role: roleName })
            .getRawOne();

        const teamAdmin = await this.adminRepo.findOne({
            where: { id: topTeam?.adminId }
        });

        const overview = {
            agent: {
                total: totalAdmins,
                active: activeAdmins,
                new: newAdmins,
                top: {
                    id: user?.parent?.parent
                        ? user?.parent?.parent?.id
                        : user?.parent?.id,
                    name: user?.parent?.parent
                        ? user?.parent?.parent?.name
                        : user?.parent?.name,
                    orderCount: topUser.orderCount
                }
            },
            team: {
                total: totalAdmins,
                active: activeAdmins,
                new: newAdmins,
                top: {
                    id: teamAdmin?.id,
                    name: teamAdmin?.name ?? '-',
                    userCount: parseInt(topTeam?.userCount, 10)
                }
            },
            support: {
                total: totalAdmins,
                active: activeAdmins,
                new: newAdmins,
                top: '-'
            }
        };

        return overview[roleName];
    }

    async findAll(
        userId: number,
        dto: SearchAdminDto
    ): Promise<{
        data: Admin[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const admin = await this.adminRepo.findOne({
            where: { id: userId },
            relations: ['role']
        });
        if (!admin) throw new InternalServerErrorException('Invalid User ID');

        const skip = (dto.page - 1) * dto.limit;
        const query = this.adminRepo
            .createQueryBuilder('admin')
            .leftJoin('admin.role', 'role')
            .leftJoin('admin.parent', 'parent')
            .select([
                'admin.id',
                'admin.name',
                'admin.email',
                'admin.referralCode',
                'admin.status',
                'admin.remark',
                'admin.lastLoginAt',
                'admin.createdAt',
                'role.id',
                'role.name',
                'parent.id',
                'parent.name',
                'parent.referralCode'
            ])
            .andWhere('admin.id != :selfId', { selfId: admin.id });

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });
            const headIds = heads.map((h) => h.id);

            const teams = await this.adminRepo.find({
                where: [
                    {
                        parent: { id: In(headIds) },
                        role: { name: RoleType.TEAM }
                    },
                    {
                        parent: { id: admin.id },
                        role: { name: RoleType.TEAM }
                    }
                ],
                select: ['id']
            });
            const teamIds = teams.map((t) => t.id);

            const adminIds = [...new Set([...headIds, ...teamIds])];
            if (adminIds.length > 0) {
                query.andWhere('admin.id IN (:...adminIds)', { adminIds });
            } else {
                query.andWhere('1 = 0');
            }
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
                query.andWhere('admin.id IN (:...teamIds)', { teamIds });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            query.andWhere('1 = 0');
        }

        if (admin.role.name === RoleType.SUPPORT) {
            query.andWhere('1 = 0');
        }

        if (dto.adminId)
            query.andWhere('admin.id = :adminId', { adminId: dto.adminId });
        if (dto.name)
            query.andWhere('admin.name LIKE :name', { name: dto.name });
        if (dto.email)
            query.andWhere('admin.email LIKE :email', { email: dto.email });
        if (dto.remark)
            query.andWhere('admin.remark LIKE :remark', { remark: dto.remark });
        if (dto.status !== undefined)
            query.andWhere('admin.status = :status', {
                status: dto.status === 1
            });
        if (dto.parentId !== undefined)
            query.andWhere('parent.id = :parentId', { parentId: dto.parentId });
        if (dto.referralCode)
            query.andWhere('admin.referralCode LIKE :referralCode', {
                referralCode: dto.referralCode
            });
        if (dto.roleName !== undefined)
            query.andWhere('role.name = :roleName', { roleName: dto.roleName });
        // 时间范围（假设 user.createdAt）
        if (dto.fromDate)
            query.andWhere('admin.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('admin.createdAt <= :toDate', {
                toDate: dto.toDate
            });

        const sortFieldMap = {
            actions: 'admin.id',
            'parent.id': 'parent.id',
            'role.id': 'role.id'
        };
        const customSortFields = [
            'agentMember',
            'headMember',
            'teamMember',
            'customerMember'
        ];
        const sortField = customSortFields.includes(dto.sortBy)
            ? null
            : (sortFieldMap[dto.sortBy] ?? `admin.${dto.sortBy}`);
        if (sortField) query.orderBy(sortField, direction);

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .getManyAndCount();

        const enhancedData = await Promise.all(
            data.map(async (d) => {
                let customerMember = 0;
                let agents: Admin[] = [];
                let heads: Admin[] = [];
                let teams: Admin[] = [];

                if (d.role.name === RoleType.ADMIN) {
                    agents = await this.adminRepo.find({
                        where: {
                            parent: { id: d.id },
                            role: { name: RoleType.AGENT }
                        },
                        select: ['id']
                    });
                    const agentIds = agents.map((a) => a.id);

                    heads = await this.adminRepo.find({
                        where: [
                            {
                                parent: { id: In(agentIds) },
                                role: { name: RoleType.HEAD }
                            },
                            {
                                parent: { id: d.id },
                                role: { name: RoleType.HEAD }
                            }
                        ],
                        select: ['id']
                    });
                    const headIds = heads.map((h) => h.id);

                    teams = await this.adminRepo.find({
                        where: [
                            {
                                parent: { id: In(headIds) },
                                role: { name: RoleType.TEAM }
                            },
                            {
                                parent: { id: In(agentIds) },
                                role: { name: RoleType.TEAM }
                            },
                            {
                                parent: { id: d.id },
                                role: { name: RoleType.TEAM }
                            }
                        ],
                        select: ['id']
                    });
                    const teamIds = teams.map((t) => t.id);

                    customerMember = await this.userRepo.count({
                        where: [
                            { parent: { id: In(teamIds) } },
                            { parent: { id: In(headIds) } },
                            { parent: { id: In(agentIds) } },
                            { parent: { id: d.id } }
                        ]
                    });
                }

                if (d.role.name === RoleType.AGENT) {
                    heads = await this.adminRepo.find({
                        where: {
                            parent: { id: d.id },
                            role: { name: RoleType.HEAD }
                        }
                    });
                    const headIds = heads.map((h) => h.id);

                    teams = await this.adminRepo.find({
                        where: [
                            {
                                parent: { id: In(headIds) },
                                role: { name: RoleType.TEAM }
                            },
                            {
                                parent: { id: d.id },
                                role: { name: RoleType.TEAM }
                            }
                        ]
                    });
                    const teamIds = teams.map((t) => t.id);

                    customerMember = await this.userRepo.count({
                        where: [
                            { parent: { id: In(teamIds) } },
                            { parent: { id: In(headIds) } },
                            { parent: { id: d.id } }
                        ]
                    });
                }

                if (d.role.name === RoleType.HEAD) {
                    teams = await this.adminRepo.find({
                        where: {
                            parent: { id: d.id },
                            role: { name: RoleType.TEAM }
                        }
                    });
                    const teamIds = teams.map((t) => t.id);

                    customerMember = await this.userRepo.count({
                        where: [
                            { parent: { id: In(teamIds) } },
                            { parent: { id: d.id } }
                        ]
                    });
                }

                if (d.role.name === RoleType.TEAM) {
                    customerMember = await this.userRepo.count({
                        where: { parent: { id: d.id } }
                    });
                }

                return {
                    ...d,
                    agentMember: agents.length,
                    headMember: heads.length,
                    teamMember: teams.length,
                    customerMember
                };
            })
        );

        if (customSortFields.includes(dto.sortBy)) {
            const isDesc = direction === 'DESC';
            enhancedData.sort((a, b) =>
                isDesc
                    ? b[dto.sortBy] - a[dto.sortBy]
                    : a[dto.sortBy] - b[dto.sortBy]
            );
        }

        const admins = {
            overview: await this.getOverviewData(admin, dto.roleName!),
            data: enhancedData,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return admins;
    }

    async findOne(id: number): Promise<Admin> {
        const admin = await this.adminRepo.findOne({ where: { id } });
        if (!admin) {
            throw new NotFoundException(`Admin with ID ${id} not found`);
        }
        return admin;
    }

    async getAllAdmins(roleName: string) {
        if (roleName === RoleType.ADMIN) {
            return await this.adminRepo.find({
                where: { role: { name: RoleType.ADMIN } },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }
    }

    async getAllAgents(roleName: string, userId: number) {
        if (roleName === RoleType.ADMIN) {
            return await this.adminRepo.find({
                where: { role: { name: RoleType.AGENT } },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }

        if (roleName === RoleType.AGENT) {
            return await this.adminRepo.find({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }
    }

    async getAllHeads(roleName: string, userId: number) {
        if (roleName === RoleType.ADMIN) {
            return await this.adminRepo.find({
                where: { role: { name: RoleType.HEAD } },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }

        if (roleName === RoleType.AGENT) {
            return await this.adminRepo.find({
                where: {
                    role: { name: RoleType.HEAD },
                    parent: { id: userId }
                },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }

        if (roleName === RoleType.HEAD) {
            return await this.adminRepo.find({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }
    }

    async getAllTeams(roleName: string, userId: number) {
        if (roleName === RoleType.ADMIN) {
            return await this.adminRepo.find({
                where: { role: { name: RoleType.TEAM } },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }

        if (roleName === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    role: { name: RoleType.HEAD },
                    parent: { id: userId }
                }
            });

            const headIds = heads.map((h) => h.id);
            return await this.adminRepo.find({
                where: {
                    role: { name: RoleType.TEAM },
                    parent: { id: In(headIds) }
                },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }

        if (roleName === RoleType.HEAD) {
            return await this.adminRepo.find({
                where: {
                    role: { name: RoleType.TEAM },
                    parent: { id: userId }
                },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }

        if (roleName === RoleType.TEAM) {
            return await this.adminRepo.find({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    referralCode: true
                }
            });
        }
    }

    async getAdminsByRole(
        userId: number,
        userRole: RoleType,
        roleName: RoleType | undefined
    ) {
        // 公共select字段
        const selectFields = {
            id: true,
            name: true,
            referralCode: true,
            role: {
                id: true,
                name: true
            }
        };

        // 根据 userRole 和目标 roleName，构造不同的查询条件
        let where: any = {};

        if (userRole === RoleType.ADMIN) {
            // 管理员能查看所有目标角色
            if (roleName) where = { role: { name: roleName } };
        } else if (userRole === RoleType.AGENT) {
            if (roleName === RoleType.AGENT) {
                // 代理看自己
                where = { id: userId };
            } else if (roleName === RoleType.HEAD) {
                // 代理看下属团长
                where = {
                    role: { name: RoleType.HEAD },
                    parent: { id: userId }
                };
            } else if (roleName === RoleType.TEAM) {
                // 代理看下属团队
                const heads = await this.adminRepo.find({
                    where: {
                        role: { name: RoleType.HEAD },
                        parent: { id: userId }
                    },
                    select: ['id']
                });
                const headIds = heads.map((h) => h.id);
                where = [
                    {
                        role: { name: RoleType.TEAM },
                        parent: { id: In(headIds) }
                    },
                    {
                        role: { name: RoleType.TEAM },
                        parent: { id: userId }
                    }
                ];
            } else if (!roleName) {
                // 没有 roleName → 返回 AGENT（自己）、HEAD（直属）、TEAM（head 下属 + 自己直属）
                const heads = await this.adminRepo.find({
                    where: {
                        role: { name: RoleType.HEAD },
                        parent: { id: userId }
                    },
                    select: ['id']
                });
                const headIds = heads.map((h) => h.id);

                where = [
                    // 自己
                    { id: userId },
                    // 直属 head
                    { role: { name: RoleType.HEAD }, parent: { id: userId } },
                    // head 下属 team
                    {
                        role: { name: RoleType.TEAM },
                        parent: { id: In(headIds) }
                    },
                    // 自己直属 team
                    { role: { name: RoleType.TEAM }, parent: { id: userId } }
                ];
            } else {
                return [];
            }
        } else if (userRole === RoleType.HEAD) {
            if (roleName === RoleType.HEAD) {
                // 团长看自己
                where = { id: userId };
            } else if (roleName === RoleType.TEAM) {
                // 团长看团队
                where = {
                    role: { name: RoleType.TEAM },
                    parent: { id: userId }
                };
            } else if (!roleName) {
                where = [
                    { id: userId },
                    { role: { name: RoleType.TEAM }, parent: { id: userId } }
                ];
            } else {
                return [];
            }
        } else if (userRole === RoleType.TEAM) {
            // 团队只能看自己
            if (roleName === RoleType.TEAM) {
                where = { id: userId };
            } else {
                return [];
            }
        } else {
            return [];
        }

        return await this.adminRepo.find({
            where,
            select: selectFields,
            relations: ['role']
        });
    }

    // Similar to findOne but doesn't throw an exception if admin not found
    async findById(id: number): Promise<Admin | null> {
        return this.adminRepo.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<Admin | null> {
        const admin = await this.adminRepo.findOne({
            where: { email },
            relations: ['role'],
            select: {
                id: true,
                email: true,
                name: true,
                status: true,
                password: true,
                twoFactorEnabled: true,
                role: {
                    id: true,
                    name: true
                }
            }
        });

        return admin;
    }

    async update(adminId: number, req: Request, dto: UpdateAdminDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['parent']
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        const targetAdmin = await this.adminRepo.findOne({
            where: { id: dto.id },
            relations: ['parent', 'role']
        });
        if (!targetAdmin)
            throw new NotFoundException(`Target Admin ID ${dto.id} not found!`);

        if (
            dto.parentId !== undefined &&
            targetAdmin.parent.id !== dto.parentId
        ) {
            const parent = await this.adminRepo.findOneBy({ id: dto.parentId });
            if (!parent) throw new BadRequestException('Invalid parentId');

            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新上级',
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label ?? '',
                targetId: targetAdmin.id,
                description: `[${admin.name}] 修改了${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }[${targetAdmin.name}]的上级：'${targetAdmin.parent.name}' -> '${parent.name}'`
            });

            targetAdmin.parent = parent;
        }

        if (dto.name !== undefined && targetAdmin.name !== dto.name) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新名称',
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label ?? '',
                targetId: targetAdmin.id,
                description: `[${admin.name}] 修改了${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }[${targetAdmin.name}]的名称：'${targetAdmin.name}' -> '${dto.name}'`
            });
            targetAdmin.name = dto.name;
        }

        if (dto.email !== undefined && targetAdmin.email !== dto.email) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新账号',
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label ?? '',
                targetId: targetAdmin.id,
                description: `[${admin.name}] 修改了${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }[${targetAdmin.name}]的账号：'${targetAdmin.email}' -> '${dto.email}'`
            });
            targetAdmin.email = dto.email;
        }

        if (dto.status !== undefined && targetAdmin.status !== dto.status) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新状态',
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label ?? '',
                targetId: targetAdmin.id,
                description: `[${admin.name}] 修改了${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }[${targetAdmin.name}]的状态：'${targetAdmin.status ? '启用' : '禁用'}' -> '${dto.status ? '启用' : '禁用'}'`
            });
            targetAdmin.status = dto.status;
        }

        if (dto.remark !== undefined && targetAdmin.remark !== dto.remark) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新备注',
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label ?? '',
                targetId: targetAdmin.id,
                description: `[${admin.name}] 修改了${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }[${targetAdmin.name}]的备注：'${targetAdmin.remark}' -> '${dto.remark}'`
            });
            targetAdmin.remark = dto.remark;
        }

        if (
            dto.referralCode !== undefined &&
            targetAdmin.referralCode !== dto.referralCode
        ) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新邀请码',
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label ?? '',
                targetId: targetAdmin.id,
                description: `[${admin.name}] 修改了${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }[${targetAdmin.name}]的邀请码：'${targetAdmin.referralCode}' -> '${dto.referralCode}'`
            });
            targetAdmin.referralCode = dto.referralCode;
        }

        await this.adminRepo.save(targetAdmin);
        await this.updateLastLogin(admin.id);
        await this.notiService.sendNotification({
            title: `更新管理员 ${
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label
            }`,
            content: `${admin.name} 更新了 管理员 [${targetAdmin.name}] 的信息`,
            type: NotificationType.ADMIN,
            path: '/admins',
            createdAt: new Date(),
            userId: admin.id,
            targetId: targetAdmin.id,
            userType: UserType.ADMIN,
            enableNoti: 0
        });
    }

    async remove(id: number): Promise<void> {
        const result = await this.adminRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Admin with ID ${id} not found`);
        }
    }

    async updatePassword(id: number, hashedPassword: string): Promise<Admin> {
        const admin = await this.findOne(id);
        admin.password = hashedPassword;

        return await this.adminRepo.save(admin);
    }

    async updateLastLogin(adminId: number) {
        await this.adminRepo.update(adminId, { lastLoginAt: new Date() });
    }

    async changePassword(adminId: number, req: Request, dto: UpdateAdminDto) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const targetAdmin = await this.adminRepo.findOne({
            where: { id: dto.id },
            relations: ['role']
        });
        if (!targetAdmin)
            throw new NotFoundException(`Agent/Team ID ${dto.id} not found!`);

        if (!dto.password)
            throw new UnauthorizedException('Missing required fields');

        await this.logService.logAdminAction(req, {
            adminId,
            userType: UserType.ADMIN,
            action: '更新密码',
            targetType:
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label ?? '',
            targetId: targetAdmin.id,
            description: `[${admin.name}] 修改了${
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label
            }[${targetAdmin.name}]的密码。`
        });
        await this.updateLastLogin(admin.id);
        await this.notiService.sendNotification({
            title: `更新管理员密码 ${
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label
            }`,
            content: `${admin.name} 更新了 管理员 [${targetAdmin.name}] 的密码`,
            type: NotificationType.ADMIN,
            path: '/admins',
            createdAt: new Date(),
            userId: admin.id,
            targetId: targetAdmin.id,
            userType: UserType.ADMIN,
            enableNoti: 0
        });
        const hashed = await this.utilityService.hashPassword(dto.password);
        targetAdmin.password = hashed;
        await this.adminRepo.save(targetAdmin);
    }

    async updateProfile(adminId: number, dto: UpdateAdminDto) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        await this.adminRepo.update(admin.id, dto);
        await this.updateLastLogin(admin.id);
    }

    async changeRole(adminId: number, req: Request, dto: UpdateAdminDto) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const targetAdmin = await this.adminRepo.findOne({
            where: { id: dto.id },
            relations: ['role']
        });
        if (!targetAdmin)
            throw new NotFoundException(`Target ID ${dto.id} not found!`);

        await this.logService.logAdminAction(req, {
            adminId,
            userType: UserType.ADMIN,
            action: '更新角色',
            targetType:
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label ?? '',
            targetId: targetAdmin.id,
            description: `[${admin.name}] 修改了${
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label
            }[${targetAdmin.name}]的管理员角色：'${
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label
            }' -> '${
                this.ROLE_OPTIONS.find((opt) => opt.value === dto.roleName)
                    ?.label
            }'`
        });
        await this.notiService.sendNotification({
            title: `更新管理员角色 ${
                this.ROLE_OPTIONS.find(
                    (opt) => opt.value === targetAdmin.role.name
                )?.label
            }`,
            content: `${admin.name} 更新了 管理员 [${targetAdmin.name}] 的角色`,
            type: NotificationType.ADMIN,
            path: '/admins',
            createdAt: new Date(),
            userId: admin.id,
            targetId: targetAdmin.id,
            userType: UserType.ADMIN,
            enableNoti: 0
        });
        await this.updateLastLogin(admin.id);

        const newRole = await this.roleRepo.findOneBy({ name: dto.roleName });
        if (!newRole)
            throw new NotFoundException(`Role Name ${dto.roleName} not found!`);

        targetAdmin.role = newRole;
        await this.adminRepo.save(targetAdmin);
    }

    async findMembers(
        adminId: number,
        dto: SearchAdminDto
    ): Promise<{
        data: Admin[] | User[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });
        if (!admin) throw new InternalServerErrorException('Invalid User ID');

        if (!dto.roleName) throw new NotFoundException('Invalid Role Type!');

        if (admin.role.name === dto.roleName) {
            throw new ForbiddenException('Input Not Allow');
        }

        if (dto.roleName === RoleType.CUSTOMER) {
            return await this.findUserMembers(dto);
        } else {
            return await this.findAdminMembers(dto);
        }
    }

    async findAdminMembers(dto: SearchAdminDto): Promise<{
        data: Admin[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const admin = await this.adminRepo.findOne({
            where: { id: dto.adminId },
            relations: ['role']
        });
        if (!admin) throw new InternalServerErrorException('Invalid Admin ID');

        const query = this.adminRepo
            .createQueryBuilder('admin')
            .leftJoin('admin.role', 'role')
            .leftJoin('admin.parent', 'parent')
            .select([
                'admin.id',
                'admin.name',
                'admin.email',
                'admin.referralCode',
                'admin.status',
                'admin.remark',
                'admin.lastLoginAt',
                'admin.createdAt',
                'role.id',
                'role.name',
                'parent.id',
                'parent.name',
                'parent.referralCode'
            ])
            .where('role.name = :roleName', { roleName: dto.roleName });

        if (admin.role.name === dto.roleName) {
            query.andWhere('1 = 0');
        }

        if (
            admin.role.name === RoleType.ADMIN &&
            dto.roleName === RoleType.AGENT
        ) {
            const agents = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            const agentIds = agents.map((h) => h.id);
            if (agentIds.length > 0) {
                query.andWhere('admin.id IN (:...adminId)', {
                    adminId: agentIds
                });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (
            admin.role.name === RoleType.ADMIN &&
            dto.roleName === RoleType.HEAD
        ) {
            const agents = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.AGENT }
                },
                select: ['id']
            });

            const agentIds = agents.map((h) => h.id);
            const heads = await this.adminRepo.find({
                where: [
                    {
                        parent: { id: In(agentIds) },
                        role: { name: RoleType.HEAD }
                    },
                    {
                        parent: { id: admin.id },
                        role: { name: RoleType.HEAD }
                    }
                ],
                select: ['id']
            });

            const headIds = heads.map((h) => h.id);
            if (headIds.length > 0) {
                query.andWhere('admin.id IN (:...adminId)', {
                    adminId: headIds
                });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (
            admin.role.name === RoleType.ADMIN &&
            dto.roleName === RoleType.TEAM
        ) {
            const agents = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.AGENT }
                },
                select: ['id']
            });

            const agentIds = agents.map((h) => h.id);
            const heads = await this.adminRepo.find({
                where: [
                    {
                        parent: { id: In(agentIds) },
                        role: { name: RoleType.HEAD }
                    },
                    {
                        parent: { id: admin.id },
                        role: { name: RoleType.HEAD }
                    }
                ],
                select: ['id']
            });

            const headIds = heads.map((h) => h.id);
            const teams = await this.adminRepo.find({
                where: [
                    { parent: { id: In(headIds) } },
                    { parent: { id: In(agentIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });
            const teamIds = teams.map((t) => t.id);
            if (teamIds.length > 0) {
                query.andWhere('admin.id IN (:...adminId)', {
                    adminId: teamIds
                });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (
            admin.role.name === RoleType.AGENT &&
            dto.roleName === RoleType.HEAD
        ) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                }
            });

            const headIds = heads.map((h) => h.id);
            if (headIds.length > 0) {
                query.andWhere('admin.id IN (:...adminId)', {
                    adminId: headIds
                });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (
            admin.role.name === RoleType.AGENT &&
            dto.roleName === RoleType.TEAM
        ) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                }
            });

            const headIds = heads.map((h) => h.id);
            const teams = await this.adminRepo.find({
                where: [
                    {
                        parent: { id: In(headIds) },
                        role: { name: RoleType.TEAM }
                    },
                    {
                        parent: { id: admin.id },
                        role: { name: RoleType.TEAM }
                    }
                ]
            });

            const teamIds = teams.map((t) => t.id);
            if (teamIds.length > 0) {
                query.andWhere('admin.id IN (:...adminId)', {
                    adminId: teamIds
                });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (
            admin.role.name === RoleType.HEAD &&
            dto.roleName === RoleType.TEAM
        ) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                }
            });

            const teamIds = teams.map((t) => t.id);
            if (teamIds.length > 0) {
                query.andWhere('admin.id IN (:...adminId)', {
                    adminId: teamIds
                });
            } else {
                query.andWhere('1 = 0');
            }
        }

        const skip = (dto.page - 1) * dto.limit;
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        const sortFieldMap = {
            actions: 'admin.id',
            'parent.id': 'parent.id'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `admin.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const admins = {
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return admins;
    }

    async findUserMembers(dto: SearchAdminDto): Promise<{
        data: User[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const admin = await this.adminRepo.findOne({
            where: { id: dto.adminId },
            relations: ['role']
        });
        if (!admin) throw new InternalServerErrorException('Invalid Admin ID');

        const query = this.userRepo
            .createQueryBuilder('user')
            .leftJoin('user.parent', 'parent')
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
                'parent.id',
                'parent.name',
                'parent.referralCode'
            ]);

        if (admin.role.name === RoleType.ADMIN) {
            const agents = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.AGENT }
                },
                select: ['id']
            });

            const agentIds = agents.map((a) => a.id);
            const heads = await this.adminRepo.find({
                where: [
                    {
                        parent: { id: In(agentIds) },
                        role: { name: RoleType.HEAD }
                    },
                    {
                        parent: { id: admin.id },
                        role: { name: RoleType.HEAD }
                    }
                ],
                select: ['id']
            });

            const headIds = heads.map((h) => h.id);
            const teams = await this.adminRepo.find({
                where: [
                    {
                        parent: { id: In(headIds) },
                        role: { name: RoleType.TEAM }
                    },
                    {
                        parent: { id: In(agentIds) },
                        role: { name: RoleType.TEAM }
                    },
                    {
                        parent: { id: admin.id },
                        role: { name: RoleType.TEAM }
                    }
                ],
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: In(agentIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((h) => h.id);
            const teams = await this.adminRepo.find({
                where: [
                    {
                        parent: { id: In(headIds) },
                        role: { name: RoleType.TEAM }
                    },
                    {
                        parent: { id: admin.id },
                        role: { name: RoleType.TEAM }
                    }
                ],
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0');
            }
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
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0');
            }
        }

        const skip = (dto.page - 1) * dto.limit;
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';
        const sortFieldMap = {
            actions: 'user.id',
            'parent.id': 'parent.id'
        };
        const sortField = sortFieldMap[dto.sortBy] ?? `user.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const users = {
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return users;
    }

    async delete(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const targetAdmin = await this.adminRepo.findOne({
                where: { id },
                relations: ['role']
            });
            if (!targetAdmin)
                throw new NotFoundException(`Target ID ${id} not found!`);

            targetAdmin.status = false;
            await this.adminRepo.save(targetAdmin);
            await this.adminRepo.softDelete(id);
            await this.updateLastLogin(admin.id);

            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: `软删除${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }`,
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label ?? '',
                targetId: id,
                description: `[${admin.name}] 软删除了该${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === targetAdmin.role.name
                    )?.label
                }：${targetAdmin.name}`
            });

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async getDeleted(
        userId: number,
        dto: SearchAdminDto
    ): Promise<{
        data: Admin[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const admin = await this.adminRepo.findOne({
            where: { id: userId },
            relations: ['role']
        });
        if (!admin) throw new InternalServerErrorException('Invalid User ID');

        if (admin.role.name === dto.roleName) {
            throw new ForbiddenException('Input Not Allow');
        }

        const skip = (dto.page - 1) * dto.limit;
        const query = this.adminRepo
            .createQueryBuilder('admin')
            .leftJoin('admin.role', 'role')
            .leftJoin('admin.parent', 'parent')
            .select([
                'admin.id',
                'admin.name',
                'admin.email',
                'admin.referralCode',
                'admin.status',
                'admin.remark',
                'admin.lastLoginAt',
                'admin.createdAt',
                'admin.deletedAt',
                'role.id',
                'role.name',
                'parent.id',
                'parent.name',
                'parent.referralCode'
            ])
            .withDeleted()
            .andWhere('admin.deletedAt IS NOT NULL');

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });
            const headIds = heads.map((h) => h.id);

            const teams = await this.adminRepo.find({
                where: [
                    {
                        parent: { id: In(headIds) },
                        role: { name: RoleType.TEAM }
                    },
                    {
                        parent: { id: admin.id },
                        role: { name: RoleType.TEAM }
                    }
                ],
                select: ['id']
            });
            const teamIds = teams.map((t) => t.id);

            const adminIds = [...new Set([...headIds, ...teamIds])];
            if (adminIds.length > 0) {
                query.andWhere('admin.id IN (:...adminIds)', { adminIds });
            } else {
                query.andWhere('1 = 0');
            }
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
                query.andWhere('admin.id IN (:...teamIds)', { teamIds });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            query.andWhere('1 = 0');
        }

        if (admin.role.name === RoleType.SUPPORT) {
            query.andWhere('1 = 0');
        }

        const sortFieldMap = {
            actions: 'admin.id',
            'parent.id': 'parent.id',
            'role.id': 'role.id'
        };
        const sortField = sortFieldMap[dto.sortBy] ?? `admin.${dto.sortBy}`;
        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const admins = {
            overview: await this.getOverviewData(admin, dto.roleName!),
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return admins;
    }

    async restore(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const deleted = await this.adminRepo.findOne({
                where: { id },
                relations: ['role'],
                withDeleted: true
            });
            if (!deleted)
                throw new NotFoundException(
                    `Deleted Admin ID ${id} not found!`
                );

            await this.adminRepo.restore(id);
            await this.updateLastLogin(admin.id);
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: `恢复${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === deleted.role.name
                    )?.label
                }`,
                targetType:
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === deleted.role.name
                    )?.label ?? '',
                targetId: id,
                description: `[${admin.name}] 恢复了该${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === deleted.role.name
                    )?.label
                }：${deleted.name}`
            });
            await this.notiService.sendNotification({
                title: `恢复管理员 ${
                    this.ROLE_OPTIONS.find(
                        (opt) => opt.value === deleted.role.name
                    )?.label
                }`,
                content: `${admin.name} 恢复了 管理员 [${deleted.name}]`,
                type: NotificationType.ADMIN,
                path: '/admins',
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
