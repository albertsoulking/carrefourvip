import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { Notification } from './entity/notification.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { AdminNotification } from './entity/notification-admin.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, Admin, AdminNotification, User])
    ],
    controllers: [NotificationController],
    providers: [NotificationGateway, NotificationService],
    exports: [NotificationGateway, NotificationService]
})
export class NotificationModule {}
