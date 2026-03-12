import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Admin } from 'src/admin/entities/admin.entity';
import { Event } from './entity/event.entity';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { SearchEventDto } from './dto/search-event.dto';
import { User } from 'src/users/entities/user.entity';
import { EventLog } from 'src/event_log/entity/event-log.entity';
import { RewardType } from 'src/event_log/enum/event-log.enum';

@Injectable()
export class EventAdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(EventLog)
        private readonly eventLogRepo: Repository<EventLog>,
        private readonly logService: LogService
    ) {}

    async createEvent(adminId: number, dto: CreateEventDto, req: Request) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        let event = this.eventRepo.create({
            ...dto,
            luckyWheel: { id: dto.luckyWheelId }
        });
        event = await this.eventRepo.save(event);

        await this.logService.logAdminAction(req, {
            adminId,
            userType: UserType.ADMIN,
            action: '创建活动',
            targetType: '活动',
            targetId: event.id,
            description: `[${admin.name}] 创建了新活动: '${dto.name}'`
        });

        return true;
    }

    async getAllEvents(adminId: number, dto: SearchEventDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        const query = this.eventRepo
            .createQueryBuilder('event')
            .select([
                'event.id',
                'event.name',
                'event.template',
                'event.type',
                'event.remark',
                'event.createdAt',
                'event.startDate',
                'event.endDate'
            ]);

        if (dto.eventId)
            query.andWhere('event.id = :eventId', { eventId: dto.eventId });
        if (dto.name)
            query.andWhere('event.name LIKE :name', { name: `%${dto.name}%` });
        if (dto.template !== undefined)
            query.andWhere('event.template = :template', {
                template: dto.template
            });
        if (dto.remark)
            query.andWhere('event.remark LIKE :remark', {
                remark: `%${dto.remark}%`
            });
        if (dto.fromDate)
            query.andWhere('event.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('event.createdAt <= :toDate', {
                toDate: dto.toDate
            });

        const skip = (dto.page - 1) * dto.limit;
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        const sortFieldMap = {
            actions: 'event.id'
        };
        const sortField = sortFieldMap[dto.sortBy] ?? `event.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const events = {
            overview: null,
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return events;
    }

    async addPoint(adminId: number, userId: number, payAmount: string) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException(`User ID ${userId} not found!`);

        const cashback = Math.floor(parseFloat(payAmount) / 100) * 10;
        const prePoint = user.point;
        const postPoint = String(parseFloat(prePoint) + cashback);

        user.point = postPoint;
        await this.userRepo.save(user);

        await this.eventLogRepo.save({
            user,
            isClaim: 1,
            claimAt: new Date(),
            reward: JSON.stringify({
                prePoint,
                changePoint: cashback,
                postPoint
            }),
            type: RewardType.POINT
        });
        
        return 'Claimed!';
    }
}
