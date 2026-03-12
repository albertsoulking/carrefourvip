import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from 'src/messages/messages.module';
import { Message } from 'src/messages/entities/message.entity';
import { AdminTicketController } from './tickets.admin.controller';
import { AdminTicketService } from './tickets.admin.service';
import { LogModule } from 'src/system_log/log.module';
import { AdminModule } from 'src/admin/admin.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Ticket, Message]),
        UsersModule,
        MessagesModule,
        LogModule,
        AdminModule,
        NotificationModule
    ],
    controllers: [TicketsController, AdminTicketController],
    providers: [TicketsService, AdminTicketService],
    exports: [TicketsService, AdminTicketService]
})
export class TicketsModule {}
