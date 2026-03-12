import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from '../users/entities/user.entity';
import { TicketStatus } from './enum/tickets.enum';
import { Message } from 'src/messages/entities/message.entity';
import { SearchTicketDto } from './dto/search-ticket.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { RoleType } from 'src/role/enum/role.enum';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepo: Repository<Ticket>,
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly dataSource: DataSource,
        private readonly notiService: NotificationService
    ) {}

    async create(
        userId: number,
        dto: CreateTicketDto
    ): Promise<{ ticketId: number }> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['role']
        });
        if (!user) {
            throw new NotFoundException(`User ID ${userId} not found`);
        }

        // 启动事务，确保 ticket 和 message 一起写入
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 检查是否已有打开的工单
            let ticket = await this.ticketRepo.findOne({
                where: {
                    user: { id: userId },
                    status: TicketStatus.OPENED
                }
            });

            // 如果没有打开的，创建一个新的
            if (!ticket) {
                ticket = this.ticketRepo.create({
                    user,
                    subject: dto.subject,
                    status: TicketStatus.OPENED
                });
                ticket = await queryRunner.manager.save(ticket);
            }

            const message = this.messageRepo.create({
                ticket,
                senderId: user.id,
                senderRole: user.role,
                content: dto.message
            });

            await this.notiService.sendNotification({
                title: 'New Message/新客户消息',
                content: `客户：${user.name}, 工单ID：${ticket.id}, 内容：${dto.message}`,
                type: NotificationType.MESSAGE,
                path: '/messages',
                createdAt: new Date(),
                userId: user.id,
                targetId: ticket.id,
                userType: UserType.ADMIN,
                enableNoti: 0
            });

            await queryRunner.manager.save(message);
            await queryRunner.commitTransaction();

            return { ticketId: Number(ticket.id) };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Failed to create ticket');
        } finally {
            await queryRunner.release();
        }
    }

    async getAll(userId: number, dto: SearchTicketDto) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new UnauthorizedException();

        const skip = (dto.page - 1) * dto.limit;
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';
        const [data, total] = await this.ticketRepo
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.user', 'user')
            .leftJoinAndSelect('ticket.messages', 'messages')
            .leftJoinAndSelect('messages.senderRole', 'senderRole')
            .loadRelationCountAndMap(
                'ticket.totalUnread', // 映射到实体 ticket.totalUnread
                'ticket.messages', // 计数的 relation
                'm', // alias
                (qb) =>
                    qb
                        .andWhere('m.isRead = 0') // 只计 isRead = 0 的消息
                        .leftJoin('m.senderRole', 'sr')
                        .andWhere('sr.name != :role', {
                            role: RoleType.CUSTOMER
                        })
            )
            .where('user.id = :userId', { userId })
            .orderBy('messages.id', 'ASC')
            .skip(skip)
            .take(dto.limit)
            .orderBy(`ticket.${dto.sortBy}`, direction)
            .getManyAndCount();

        const tickets = {
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return tickets;
    }

    async readTicket(userId: number, id: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new UnauthorizedException();

        const ticket = await this.ticketRepo.findOne({
            where: { id }
        });
        if (!ticket) throw new NotFoundException(`Ticket ID ${id} not found`);

        await this.notiService.sendNotification({
            title: 'Read Message',
            content: `Customer ${user.name} read the messages of ticket ID ${ticket.id}`,
            type: NotificationType.MESSAGE,
            path: '/messages',
            createdAt: new Date(),
            userId: user.id,
            targetId: ticket.id,
            userType: UserType.USER,
            enableNoti: 0
        });

        return await this.messageRepo.update(
            {
                ticket: { id },
                senderId: Not(userId),
                isRead: 0
            },
            {
                isRead: 1,
                readAt: new Date()
            }
        );
    }
}
