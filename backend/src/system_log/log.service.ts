import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './entity/log.entity';
import { Repository } from 'typeorm';
import { CreateLogDto } from './dto/create-log.dto';
import { Request } from 'express';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { Admin } from 'src/admin/entities/admin.entity';
import { User } from 'src/users/entities/user.entity';
import { SearchLogDto } from './dto/search-log.dto';
import { IpService } from 'src/ip/ip.service';

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(Log)
        private readonly logRepo: Repository<Log>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly ipService: IpService
    ) {}

    async logAdminAction(req: Request, dto: CreateLogDto) {
        const geoInfo = await this.ipService.getGeoInfoByIp(req);

        let user: any = null;
        let admin: any = null;
        const userId = (req as any)?.user.id;

        if (dto.userType === UserType.USER) {
            user = await this.userRepo.findOneBy({ id: userId });
        }

        if (dto.userType === UserType.ADMIN) {
            admin = await this.adminRepo.findOneBy({ id: userId });
        }

        await this.logRepo.save({
            ...dto,
            user: dto.userType === UserType.USER ? { id: dto.userId } : null,
            admin: dto.userType === UserType.ADMIN ? { id: dto.adminId } : null,
            ipAddress: geoInfo?.ip,
            city: geoInfo?.city,
            zipCode: geoInfo?.postal,
            state: geoInfo?.region,
            country: geoInfo?.country_name
        });
    }

    async getAll(dto: SearchLogDto) {
        const skip = (dto.page - 1) * dto.limit;

        const query = this.logRepo
            .createQueryBuilder('log')
            .leftJoin('log.admin', 'admin')
            .leftJoin('log.user', 'user')
            .select([
                'log.id',
                'log.userType',
                'log.action',
                'log.targetType',
                'log.targetId',
                'log.description',
                'log.ipAddress',
                'log.city',
                'log.zipCode',
                'log.state',
                'log.country',
                'log.createdAt',
                'admin.id',
                'admin.name',
                'admin.email',
                'user.id',
                'user.name',
                'user.email'
            ])
            .andWhere('log.userType = :userType', { userType: dto.userType });

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        if (dto.logId) query.andWhere('log.id = :logId', { logId: dto.logId });
        if (dto.userId)
            query.andWhere('user.id = :userId', { userId: dto.userId });
        if (dto.adminId)
            query.andWhere('admin.id = :adminId', { adminId: dto.adminId });

        const sortFieldMap = {
            'admin.name': 'admin.name',
            'admin.email': 'admin.email',
            'user.name': 'user.name',
            'user.email': 'user.email'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `log.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const logs = {
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return logs;
    }

    async getClientIp(req: Request): Promise<string> {
        const xForwardedFor = req.headers['x-forwarded-for'];
        let ip =
            typeof xForwardedFor === 'string'
                ? xForwardedFor.split(',')[0].trim()
                : req.socket.remoteAddress || '';

        return ip;
    }
}
