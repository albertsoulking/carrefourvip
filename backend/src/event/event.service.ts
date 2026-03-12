import {
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Admin } from 'src/admin/entities/admin.entity';
import { Event } from './entity/event.entity';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { UpdateEventDto } from './dto/update-event.dto';
import { RewardType } from 'src/event_log/enum/event-log.enum';
import { EventLog } from 'src/event_log/entity/event-log.entity';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,
        @InjectRepository(EventLog)
        private readonly eventLogRepo: Repository<EventLog>,
        private readonly logService: LogService
    ) {}

    async getAll(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException(`User ID ${userId} not found!`);

        return await this.eventRepo.find({
            where: [{ endDate: MoreThan(new Date()) }, { endDate: IsNull() }],
            select: {
                id: true,
                name: true,
                startDate: true
            }
        });
    }

    async getOne(userId: number, id: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException(`User ID ${userId} not found!`);

        return await this.eventRepo.findOne({
            where: { id },
            relations: ['luckyWheel'],
            select: {
                id: true,
                name: true,
                luckyWheel: {
                    id: true,
                    prizes: true
                }
            }
        });
    }

    async getResult(userId: number, id: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException(`User ID ${userId} not found!`);

        const event = await this.eventRepo.findOne({
            where: { id },
            relations: ['luckyWheel']
        });
        if (!event) throw new NotFoundException('Event Not Found!');

        const prizes = JSON.parse(event.luckyWheel.prizes);
        const hasRange = prizes.some((prize: any) => /\d/.test(prize.range));

        return !hasRange ? Math.floor(Math.random() * prizes.length) : -1;
    }

    async setResult(userId: number, dto: UpdateEventDto) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException(`User ID ${userId} not found!`);

        const event = await this.eventRepo.findOne({
            where: { id: dto.eventId },
            relations: ['luckyWheel']
        });
        if (!event) throw new NotFoundException('Event Not Found!');

        const prizes = JSON.parse(event.luckyWheel.prizes);
        const reward = prizes[dto.prizeId];

        let eventLog: any = null;

        if (reward.type === RewardType.POINT) {
            eventLog = await this.eventLogRepo.save({
                user,
                event,
                type: RewardType.POINT,
                reward: JSON.stringify({
                    prePoint: '0',
                    changePoint: reward.fonts[0].text,
                    postPoint: '0'
                })
            });
        }

        return { id: eventLog.id };
    }

    async claimReward(userId: number, rewardId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException(`User ID ${userId} not found!`);

        const eventLog = await this.eventLogRepo.findOne({
            where: { id: rewardId }
        });
        if (!eventLog) throw new NotFoundException('Reward Expired!');

        if (eventLog.isClaim === 1) return 'Already Claimed!';

        if (eventLog.type === RewardType.POINT) {
            const reward = JSON.parse(eventLog.reward);
            const prePoint = user.point;
            const postPoint = String(parseFloat(prePoint) + parseFloat(reward.changePoint));

            user.point = postPoint;
            await this.userRepo.save(user);

            eventLog.reward = JSON.stringify({
                prePoint,
                changePoint: reward.changePoint,
                postPoint
            });
            eventLog.isClaim = 1;
            eventLog.claimAt = new Date();
            await this.eventLogRepo.save(eventLog);
        }

        return 'Claimed!';
    }
}
