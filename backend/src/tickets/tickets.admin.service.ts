import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { RoleType } from 'src/role/enum/role.enum';
import { User } from 'src/users/entities/user.entity';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { UserMode } from 'src/users/enum/user.enum';
import { TicketStatus } from './enum/tickets.enum';
import { AdminService } from 'src/admin/admin.service';
import { SearchTicketDto } from './dto/search-ticket.dto';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';

@Injectable()
export class AdminTicketService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepo: Repository<Ticket>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly logService: LogService,
        private readonly adminService: AdminService,
        private readonly dataSource: DataSource,
        private readonly notiService: NotificationService
    ) {}

    async getAll(adminId: number, dto: SearchTicketDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });

        if (!admin) throw new UnauthorizedException();

        const skip = (dto.page - 1) * dto.limit;
        const query = this.ticketRepo
            .createQueryBuilder('ticket')
            .leftJoin('ticket.user', 'user')
            .leftJoin('user.parent', 'parent')
            .leftJoin('ticket.messages', 'messages')
            .leftJoin('messages.senderRole', 'senderRole')
            .select([
                'ticket.id',
                'ticket.subject',
                'ticket.status',
                'ticket.createdAt',
                'user.id',
                'user.avatar',
                'user.name',
                'user.email',
                'user.mode',
                'parent.id',
                'parent.name',
                'messages.id',
                'messages.senderId',
                'messages.content',
                'messages.isRead',
                'messages.createdAt',
                'messages.readAt',
                'senderRole.id',
                'senderRole.name'
            ])
            .orderBy('messages.id', 'ASC');

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

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

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
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

        if (dto.ticketId)
            query.andWhere('ticket.id = :ticketId', { ticketId: dto.ticketId });
        if (dto.name)
            query.andWhere('user.name LIKE :name', { name: `%${dto.name}%` });
        if (dto.email)
            query.andWhere('user.email LIKE :email', {
                email: `%${dto.email}%`
            });
        if (dto.subject)
            query.andWhere('ticket.subject LIKE :subject', {
                subject: `%${dto.subject}%`
            });
        if (dto.mode !== undefined)
            query.andWhere('user.mode = :mode', { mode: dto.mode });
        if (dto.parentId !== undefined)
            query.andWhere('parent.id = :parentId', { parentId: dto.parentId });
        if (dto.status !== undefined)
            query.andWhere('ticket.status = :status', { status: dto.status });
        // 时间范围
        if (dto.fromDate)
            query.andWhere('ticket.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('ticket.createdAt <= :toDate', {
                toDate: dto.toDate
            });

        const sortFieldMap = {
            actions: 'ticket.id',
            'user.name': 'user.name',
            'user.email': 'user.email',
            'user.mode': 'user.mode',
            'parent.name': 'parent.name'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `ticket.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        // 提取所有 senderId
        const userIds: number[] = [];
        const adminIds: number[] = [];

        data.forEach((ticket) => {
            ticket.messages?.forEach((msg) => {
                if (msg.senderRole?.name === RoleType.CUSTOMER) {
                    userIds.push(msg.senderId);
                } else {
                    adminIds.push(msg.senderId);
                }
            });
        });

        // 去重
        const uniqueUserIds = [...new Set(userIds)];
        const uniqueAdminIds = [...new Set(adminIds)];

        // 查 sender 数据
        const senderUsers = await this.userRepo.find({
            where: { id: In(uniqueUserIds) },
            select: ['id', 'name']
        });
        const senderAdmins = await this.adminRepo.find({
            where: { id: In(uniqueAdminIds) },
            select: ['id', 'name']
        });

        // 构建 map
        const senderUserMap = new Map(senderUsers.map((u) => [u.id, u]));
        const senderAdminMap = new Map(senderAdmins.map((a) => [a.id, a]));

        // 合并 sender 信息进 messages
        data.forEach((ticket) => {
            ticket.messages?.forEach((msg) => {
                if (msg.senderRole?.name === RoleType.CUSTOMER) {
                    msg.sender = senderUserMap.get(msg.senderId) || null;
                } else {
                    msg.sender = senderAdminMap.get(msg.senderId) || null;
                }
            });
        });

        const orders = {
            overview: null,
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return orders;
    }

    async update(adminId: number, req: Request, dto: UpdateTicketDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });

        if (!admin) throw new UnauthorizedException();

        const ticket = await this.ticketRepo.findOne({
            where: { id: dto.id },
            relations: ['user']
        });
        if (!ticket)
            throw new NotFoundException(`Ticket ID ${dto.id} not found`);

        if (ticket.status !== dto.status) {
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '更新状态',
                targetType: '工单',
                targetId: ticket.user.id,
                description: `[${admin.name}] 修改了客户[${ticket.user.name}/${ticket.user.mode === UserMode.LIVE ? '正式' : '试玩'}]工单状态：'${ticket.status === TicketStatus.OPENED ? '处理中' : '已关闭'}' -> '${dto.status === TicketStatus.OPENED ? '处理中' : '已关闭'}'。`
            });

            ticket.status = dto.status;
        }

        await this.ticketRepo.save(ticket);
        await this.adminService.updateLastLogin(adminId);
        await this.notiService.sendNotification({
            title: '更新工单',
            content: `${admin.name} 更新了 工单 #${ticket.id}`,
            type: NotificationType.MESSAGE,
            path: '/messages',
            createdAt: new Date(),
            userId: admin.id,
            targetId: ticket.id,
            userType: UserType.ADMIN,
            enableNoti: 0
        });
    }

    async delete(adminId: number, id: number, req: Request) {
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
                where: { id },
                relations: ['user']
            });
            if (!ticket)
                throw new NotFoundException(`Tikcet ID ${id} not found`);

            ticket.status = TicketStatus.CLOSED;
            await this.ticketRepo.save(ticket);
            await this.ticketRepo.softDelete(id);
            await this.logService.logAdminAction(req, {
                adminId,
                userType: UserType.ADMIN,
                action: '软删除工单',
                targetType: '工单',
                targetId: ticket.id,
                description: `[${admin.name}] 软删除了工单[客户：${ticket.user.name}/${ticket.user.mode === UserMode.LIVE ? '正式' : '试玩'}][工单ID：${ticket.id}]内容：'${ticket.subject}'`
            });
            await this.notiService.sendNotification({
                title: '删除工单',
                content: `${admin.name} 删除了 工单 #${ticket.id}`,
                type: NotificationType.MESSAGE,
                path: '/messages',
                createdAt: new Date(),
                userId: admin.id,
                targetId: ticket.id,
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

    async getDeleted(adminId: number, dto: SearchTicketDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });

        if (!admin) throw new UnauthorizedException();

        const skip = (dto.page - 1) * dto.limit;
        const query = this.ticketRepo
            .createQueryBuilder('ticket')
            .leftJoin('ticket.user', 'user')
            .leftJoin('user.parent', 'parent')
            .leftJoin('ticket.messages', 'messages')
            .leftJoin('messages.senderRole', 'senderRole')
            .select([
                'ticket.id',
                'ticket.subject',
                'ticket.status',
                'ticket.createdAt',
                'ticket.deletedAt',
                'user.id',
                'user.avatar',
                'user.name',
                'user.email',
                'user.mode',
                'parent.id',
                'parent.name',
                'messages.id',
                'messages.senderId',
                'messages.content',
                'messages.isRead',
                'messages.createdAt',
                'senderRole.id',
                'senderRole.name'
            ])
            .withDeleted()
            .andWhere('ticket.deletedAt IS NOT NULL');

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

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

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
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

        if (dto.ticketId)
            query.andWhere('ticket.id = :ticketId', { ticketId: dto.ticketId });
        if (dto.name)
            query.andWhere('user.name LIKE :name', { name: `%${dto.name}%` });
        if (dto.email)
            query.andWhere('user.email LIKE :email', {
                email: `%${dto.email}%`
            });
        if (dto.subject)
            query.andWhere('ticket.subject LIKE :subject', {
                subject: `%${dto.subject}%`
            });
        if (dto.mode !== undefined)
            query.andWhere('user.mode = :mode', { mode: dto.mode });
        if (dto.parentId !== undefined)
            query.andWhere('parent.id = :parentId', { parentId: dto.parentId });
        if (dto.status !== undefined)
            query.andWhere('ticket.status = :status', { status: dto.status });
        // 时间范围
        if (dto.fromDate)
            query.andWhere('ticket.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('ticket.createdAt <= :toDate', {
                toDate: dto.toDate
            });

        const sortFieldMap = {
            actions: 'ticket.id',
            'user.name': 'user.name',
            'user.email': 'user.email',
            'user.mode': 'user.mode',
            'parent.name': 'parent.name'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `ticket.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        // 提取所有 senderId
        const userIds: number[] = [];
        const adminIds: number[] = [];

        data.forEach((ticket) => {
            ticket.messages?.forEach((msg) => {
                if (msg.senderRole?.name === RoleType.CUSTOMER) {
                    userIds.push(msg.senderId);
                } else {
                    adminIds.push(msg.senderId);
                }
            });
        });

        // 去重
        const uniqueUserIds = [...new Set(userIds)];
        const uniqueAdminIds = [...new Set(adminIds)];

        // 查 sender 数据
        const senderUsers = await this.userRepo.find({
            where: { id: In(uniqueUserIds) },
            select: ['id', 'name']
        });
        const senderAdmins = await this.adminRepo.find({
            where: { id: In(uniqueAdminIds) },
            select: ['id', 'name']
        });

        // 构建 map
        const senderUserMap = new Map(senderUsers.map((u) => [u.id, u]));
        const senderAdminMap = new Map(senderAdmins.map((a) => [a.id, a]));

        // 合并 sender 信息进 messages
        data.forEach((ticket) => {
            ticket.messages?.forEach((msg) => {
                if (msg.senderRole?.name === RoleType.CUSTOMER) {
                    msg.sender = senderUserMap.get(msg.senderId) || null;
                } else {
                    msg.sender = senderAdminMap.get(msg.senderId) || null;
                }
            });
        });

        const orders = {
            overview: null,
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return orders;
    }

    async restore(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const deleted = await this.ticketRepo.findOne({
                where: { id },
                withDeleted: true
            });
            if (!deleted)
                throw new NotFoundException(
                    `Deleted Ticket ID ${id} not found!`
                );

            await this.ticketRepo.restore(id);
            await this.adminService.updateLastLogin(admin.id);

            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '恢复工单',
                targetType: '工单',
                targetId: id,
                description: `[${admin.name}] 恢复了该工单：${deleted.subject}`
            });
            await this.notiService.sendNotification({
                title: '恢复工单',
                content: `${admin.name} 恢复了 工单 #${deleted.id}`,
                type: NotificationType.MESSAGE,
                path: '/messages',
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
