import {
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { Admin } from 'src/admin/entities/admin.entity';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { UserMode } from 'src/users/enum/user.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { AdminService } from 'src/admin/admin.service';
import { NotificationType } from 'src/notification/enum/notification.enum';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AdminMessageService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Ticket)
        private readonly ticketRepo: Repository<Ticket>,
        private readonly logService: LogService,
        private readonly dataSource: DataSource,
        private readonly adminService: AdminService,
        private readonly notiService: NotificationService
    ) {}

    async getAll(adminId: number, ticketId: number) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });
        if (!admin)
            throw new NotFoundException(`Admin Id ${adminId} not found`);

        const messages = await this.messageRepo.find({
            where: { ticket: { id: ticketId } },
            relations: ['senderRole']
        });

        return messages;
    }

    async create(adminId: number, dto: CreateMessageDto, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOne({
                where: { id: adminId },
                relations: ['role']
            });
            if (!admin)
                throw new NotFoundException(`Admin Id ${adminId} not found`);

            const ticket = await this.ticketRepo.findOne({
                where: { id: dto.ticketId },
                relations: ['user']
            });
            if (!ticket)
                throw new NotFoundException(
                    `Ticket Id ${dto.ticketId} not found`
                );

            const message = this.messageRepo.create({
                ticket: { id: ticket.id },
                senderId: admin.id,
                senderRole: { id: admin.role.id },
                content: dto.message
            });
            await this.messageRepo.save(message);

            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '发送消息',
                targetType: '消息',
                targetId: message.id,
                description: `[${admin.name}] 发送给客户[${ticket.user.name}/${ticket.user.mode === UserMode.LIVE ? '正式' : '试玩'}]消息[工单ID: #${ticket.id}]：'${dto.message}'`
            });
            await this.notiService.sendNotification({
                title: '创建工单/发消息',
                content: `${admin.name} 创建了/发消息 工单 #${ticket.id}`,
                type: NotificationType.MESSAGE,
                path: '/messages',
                createdAt: new Date(),
                userId: ticket.user.id,
                targetId: ticket.id,
                userType: UserType.USER,
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

    async delete(adminId: number, msgId: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const message = await this.messageRepo.findOne({
                where: { id: msgId },
                relations: ['ticket', 'ticket.user']
            });
            if (!message)
                throw new NotFoundException(`Message ID ${msgId} not found`);

            await this.messageRepo.delete(msgId);
            await this.adminService.updateLastLogin(admin.id);

            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '删除消息',
                targetType: '消息',
                targetId: message.id,
                description: `[${admin.name}] 删除了自己的消息[客户：${message.ticket.user.name}/${message.ticket.user.mode === UserMode.LIVE ? '正式' : '试玩'}][工单ID：${message.ticket.id}]：${message.content}`
            });
            await this.notiService.sendNotification({
                title: '删除工单',
                content: `${admin.name} 删除了 工单 #${message.ticket.id}`,
                type: NotificationType.MESSAGE,
                path: '/messages',
                createdAt: new Date(),
                userId: admin.id,
                targetId: message.ticket.id,
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
