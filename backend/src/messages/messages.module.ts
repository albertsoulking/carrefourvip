import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './messages.service';
import { MessageController } from './messages.controller';
import { Message } from './entities/message.entity';
import { UsersModule } from '../users/users.module';
import { AdminMessageController } from './messages.admin.controller';
import { AdminMessageService } from './messages.admin.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { LogModule } from 'src/system_log/log.module';
import { AdminModule } from 'src/admin/admin.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Ticket]),
        forwardRef(() => UsersModule),
        LogModule,
        AdminModule,
        NotificationModule
    ],
    controllers: [MessageController, AdminMessageController],
    providers: [MessageService, AdminMessageService],
    exports: [MessageService, AdminMessageService]
})
export class MessagesModule {}
