import {
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { CreateNotificationDto } from './dto/create-notificaiton.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entity/notification.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { AdminNotification } from './entity/notification-admin.entity';
import { User } from 'src/users/entities/user.entity';
import { RoleType } from 'src/role/enum/role.enum';
import { NotificationType } from './enum/notification.enum';

@Injectable()
export class NotificationService {
    constructor(
        private gateway: NotificationGateway,
        @InjectRepository(Notification)
        private readonly notiRepo: Repository<Notification>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(AdminNotification)
        private readonly adminNotiRepo: Repository<AdminNotification>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly dataSource: DataSource
    ) {}

    async sendNotification(dto: CreateNotificationDto) {
        try {
            // 找 agent
            let agent: Admin | null = null;
            let current: Admin | User | null = await this.userRepo.findOne({
                where: { id: dto.userId },
                relations: ['parent', 'parent.role']
            });

            while (current && current.parent) {
                const parent = current.parent;
                if (parent.role.name === RoleType.AGENT) {
                    agent = parent;
                    break;
                }
                current = parent;
            }

            // 收集通知接收人
            const recipients: Admin[] = [];
            const admins = await this.adminRepo.find({
                where: { role: { name: RoleType.ADMIN } },
                relations: ['role']
            });
            recipients.push(...admins);
            if (agent) recipients.push(agent);

            if (
                [NotificationType.ORDER, NotificationType.USER, NotificationType.FLIGHT_BOOKING].includes(
                    dto.type
                )
            ) {
                const teamAndHeads = await this.adminRepo
                    .createQueryBuilder('admin')
                    .leftJoinAndSelect('admin.role', 'role')
                    .leftJoinAndSelect('admin.children', 'child')
                    .where('role.name IN (:...roles)', {
                        roles: [RoleType.TEAM, RoleType.HEAD]
                    })
                    .andWhere('child.id = :userId', { userId: dto.userId })
                    .getMany();

                recipients.push(...teamAndHeads);
            }

            // === 核心改动：事务只负责数据库写入 ===
            const noti = await this.dataSource.transaction(async (manager) => {
                const noti = manager.getRepository(Notification).create(dto);
                await manager.save(noti);

                if (recipients.length > 0) {
                    const adminNotis = recipients.map((admin) => ({
                        adminId: admin.id,
                        notificationId: noti.id
                    }));

                    await manager
                        .getRepository(AdminNotification)
                        .createQueryBuilder()
                        .insert()
                        .values(adminNotis)
                        .execute();
                }

                return noti;
            });

            // === 事务外再推送 ===
            const newNoti = await this.notiRepo.findOne({
                where: { id: noti.id },
                relations: ['adminNotification']
            });
            this.gateway.sendNotification(newNoti);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async getAll(adminId: number) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        const query = await this.notiRepo
            .createQueryBuilder('noti')
            .innerJoin(
                'noti.adminNotification',
                'adminNoti',
                'adminNoti.adminId = :adminId',
                { adminId }
            )
            .innerJoin('adminNoti.admin', 'admin')
            .select([
                'noti.id',
                'noti.title',
                'noti.content',
                'noti.type',
                'noti.path',
                'noti.targetId',
                'noti.createdAt',
                'noti.userType',
                'noti.enableNoti',
                'adminNoti.id',
                'adminNoti.adminId',
                'adminNoti.isRead',
                'admin.id'
            ])
            .orderBy('noti.createdAt', 'DESC')
            .take(100)
            .getMany();

        return query;
    }

    async update(adminId: number, ids: number[]) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        await this.adminNotiRepo.update(
            {
                adminId,
                notificationId: In(ids),
                isRead: 0
            },
            {
                isRead: 1,
                readAt: new Date()
            }
        );
    }

    async markAllAsRead(adminId: number) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        await this.adminNotiRepo.update(
            {
                adminId,
                isRead: 0
            },
            {
                isRead: 1,
                readAt: new Date()
            }
        );
    }
}
