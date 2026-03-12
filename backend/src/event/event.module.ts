import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Event } from './entity/event.entity';
import { LogModule } from 'src/system_log/log.module';
import { EventAdminController } from './event.admin.controller';
import { EventAdminService } from './event.admin.service';
import { EventLog } from 'src/event_log/entity/event-log.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Admin, Event, EventLog]),
        LogModule
    ],
    controllers: [EventController, EventAdminController],
    providers: [EventService, EventAdminService],
    exports: [EventService, EventAdminService]
})
export class EventModule {}
