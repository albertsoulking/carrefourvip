import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLuckyWheelDto } from './dto/create-wheel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { LuckyWheel } from './entity/wheel.entity';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { SearchLuckyWheelDto } from './dto/search-wheel.dto';

@Injectable()
export class LuckyWheelService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(LuckyWheel)
        private readonly luckyWheelRepo: Repository<LuckyWheel>,
        private readonly logService: LogService
    ) {}

    async create(adminId: number, dto: CreateLuckyWheelDto, req: Request) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        let luckyWheel = this.luckyWheelRepo.create(dto);
        luckyWheel = await this.luckyWheelRepo.save(luckyWheel);

        await this.logService.logAdminAction(req, {
            adminId,
            userType: UserType.ADMIN,
            action: '创建活动',
            targetType: '活动',
            targetId: luckyWheel.id,
            description: `[${admin.name}] 创建了新幸运大转盘: '${dto.name}'`
        });

        return true;
    }

    async getAll(adminId: number, dto: SearchLuckyWheelDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        const query = this.luckyWheelRepo
            .createQueryBuilder('wheel')
            .select([
                'wheel.id',
                'wheel.name',
                'wheel.prizes',
                'wheel.createdAt'
            ]);

        if (dto.luckyWheelId)
            query.andWhere('wheel.id = :luckyWheelId', {
                luckyWheelId: dto.luckyWheelId
            });
        if (dto.name)
            query.andWhere('wheel.name LIKE :name', { name: `%${dto.name}%` });
        if (dto.fromDate)
            query.andWhere('wheel.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('wheel.createdAt <= :toDate', {
                toDate: dto.toDate
            });

        const skip = (dto.page - 1) * dto.limit;
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        const sortFieldMap = {
            actions: 'wheel.id'
        };
        const sortField = sortFieldMap[dto.sortBy] ?? `wheel.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const wheels = {
            overview: null,
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return wheels;
    }

    async findAll(adminId: number) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        return await this.luckyWheelRepo.find({
            select: {
                id: true,
                name: true
            }
        });
    }
}
