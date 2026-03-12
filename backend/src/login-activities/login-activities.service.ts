import {
    Injectable,
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginActivity } from './entities/login-activity.entity';
import { CreateLoginActivityDto } from './dto/create-login-activity.dto';
import { Admin } from 'src/admin/entities/admin.entity';
import { UserType } from './enum/login-activities.enum';
import { RoleType } from 'src/role/enum/role.enum';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { SearchLoginActivityDto } from './dto/search-login-activity.dto';
import { IpService } from 'src/ip/ip.service';

@Injectable()
export class LoginActivitiesService {
    constructor(
        @InjectRepository(LoginActivity)
        private readonly loginActivityRepo: Repository<LoginActivity>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly ipService: IpService
    ) {}

    async create(dto: CreateLoginActivityDto): Promise<void> {
        try {
            const { userId, userType, ...rest } = dto;

            let user: any = null;
            let admin: any = null;

            if (userType === UserType.USER) {
                user = await this.userRepo.findOneBy({ id: userId });
            }

            if (userType === UserType.ADMIN) {
                admin = await this.adminRepo.findOneBy({ id: userId });
            }

            // Create the login activity with the appropriate relation
            const loginActivity = this.loginActivityRepo.create({
                ...rest,
                userId,
                userType,
                user: userType === UserType.USER ? { id: userId } : null,
                admin: userType === UserType.ADMIN ? { id: userId } : null
            });

            await this.loginActivityRepo.save(loginActivity);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    // Helper method to record login activity from auth service
    async recordLoginActivity(
        req: Request,
        dto: CreateLoginActivityDto
    ): Promise<void> {
        const userAgent = req?.headers['user-agent'] || 'Unknown';
        const geoInfo = await this.ipService.getGeoInfoByIp(req);

        // Parse user agent to get browser and device info
        let browser = 'unknown';
        let device = 'unknown';
        let os = 'unknown';

        if (userAgent) {
            if (userAgent.includes('Chrome')) browser = 'chrome';
            else if (userAgent.includes('Firefox')) browser = 'firefox';
            else if (userAgent.includes('Safari')) browser = 'safari';
            else if (userAgent.includes('Edge')) browser = 'edge';
            else if (
                userAgent.includes('MSIE') ||
                userAgent.includes('Trident')
            )
                browser = 'ie';

            if (userAgent.includes('Mobile')) device = 'mobile';
            else if (userAgent.includes('Tablet')) device = 'tablet';
            else device = 'desktop';

            if (userAgent.includes('Windows')) os = 'windows';
            else if (userAgent.includes('Mac')) os = 'macos';
            else if (userAgent.includes('Linux')) os = 'linux';
            else if (userAgent.includes('Android')) os = 'android';
            else if (userAgent.includes('iOS')) os = 'ios';
        }

        await this.create({
            userId: dto.userId,
            userType: dto.userType,
            type: dto.type,
            ip: geoInfo?.ip,
            browser,
            device,
            os,
            city: geoInfo?.city,
            state: geoInfo?.region,
            zipCode: geoInfo?.postal,
            country: geoInfo?.country_name
        });
    }

    async getAll(adminId: number, dto: SearchLoginActivityDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const skip = (dto.page - 1) * dto.limit;

        const query = this.loginActivityRepo
            .createQueryBuilder('activity')
            .leftJoin('activity.user', 'user')
            .leftJoin('user.parent', 'userParent')
            .leftJoin('activity.admin', 'admin')
            .leftJoin('admin.parent', 'adminParent')
            .leftJoin('admin.role', 'adminRole')
            .select([
                'activity.id',
                'activity.userId',
                'activity.userType',
                'activity.type',
                'activity.ip',
                'activity.browser',
                'activity.device',
                'activity.os',
                'activity.details',
                'activity.city',
                'activity.zipCode',
                'activity.state',
                'activity.country',
                'activity.createdAt',
                'user.id',
                'user.name',
                'user.email',
                'user.avatar',
                'user.mode',
                'user.remark',
                'userParent.id',
                'userParent.name',
                'admin.id',
                'admin.name',
                'admin.email',
                'admin.remark',
                'adminParent.id',
                'adminParent.name',
                'adminRole.id',
                'adminRole.name'
            ]);
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        if (dto.userId)
            query.andWhere('user.id = :userId', { userId: dto.userId });
        if (dto.adminId)
            query.andWhere('admin.id = :adminId', { adminId: dto.adminId });
        if (dto.mode !== undefined)
            query.andWhere('user.mode = :mode', { mode: dto.mode });
        if (dto.parentId) {
            if (dto.userType === UserType.USER)
                query.andWhere('userParent.id = :parentId', {
                    parentId: dto.parentId
                });
            if (dto.userType === UserType.ADMIN)
                query.andWhere('adminParent.id = :parentId', {
                    parentId: dto.parentId
                });
        }
        if (dto.name)
            query.andWhere('user.name LIKE :name', { name: `%${dto.name}%` });
        if (dto.email)
            query.andWhere('user.email LIKE :email', {
                email: `%${dto.email}%`
            });
        if (dto.remark)
            query.andWhere('user.remark LIKE :remark', {
                remark: `%${dto.remark}%`
            });
        if (dto.type)
            query.andWhere('activity.type = :type', { type: dto.type });
        // 时间范围
        if (dto.fromDate)
            query.andWhere('activity.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('activity.createdAt <= :toDate', {
                toDate: dto.toDate
            });

        query.andWhere('activity.userType = :userType', {
            userType: dto.userType
        });

        if (dto.userType === UserType.USER) {
            if (admin.role.name === RoleType.AGENT) {
                const teams = await this.adminRepo.find({
                    where: {
                        parent: { id: admin.id },
                        role: { name: RoleType.TEAM }
                    },
                    relations: ['role', 'parent']
                });

                const teamIds = teams.map((t) => t.id);
                if (teamIds.length > 0) {
                    query.andWhere('userParent.id IN (:...teamIds)', {
                        teamIds
                    });
                } else {
                    query.andWhere('1=0'); // 无结果
                }
            }

            if (admin.role.name === RoleType.TEAM) {
                query.andWhere('userParent.id = :parentId', {
                    parentId: admin.id
                });
            }
        }

        if (dto.userType === UserType.ADMIN) {
            query.andWhere('adminRole.name = :roleType', {
                roleType: dto.roleType
            });

            const role = admin.role.name;

            // 判断是否有权限访问此 roleType
            const hasAccess = () => {
                if (role === RoleType.ADMIN) return true;

                if (dto.roleType === RoleType.AGENT) {
                    return role === RoleType.AGENT;
                }

                if (dto.roleType === RoleType.TEAM) {
                    return role === RoleType.AGENT || role === RoleType.TEAM;
                }

                if (dto.roleType === RoleType.SUPPORT) {
                    return role === RoleType.SUPPORT;
                }

                return false;
            };

            if (!hasAccess()) {
                query.andWhere('1 = 0');
            } else {
                if (dto.roleType === role) {
                    query.andWhere('admin.id = :adminId', {
                        adminId: admin.id
                    });
                }

                if (dto.roleType === RoleType.TEAM && role === RoleType.AGENT) {
                    query.andWhere('adminParent.id = :agentId', {
                        agentId: admin.id
                    });
                }
            }
        }

        const sortFieldMap = {
            actions: 'activity.id',
            'user.id': 'user.id',
            'user.name': 'user.name',
            'user.email': 'user.email',
            'user.avatar': 'user.avatar',
            'user.mode': 'user.mode',
            'user.remark': 'user.remark',
            'userParent.name': 'userParent.name',
            'admin.id': 'admin.id',
            'admin.name': 'admin.name',
            'admin.email': 'admin.email',
            'admin.remark': 'admin.remark',
            'adminParent.name': 'adminParent.name',
            'adminRole.name': 'adminRole.name'
        };
        const sortField = sortFieldMap[dto.sortBy] ?? `activity.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const activities = {
            overview: null,
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return activities;
    }
}
