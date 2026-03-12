import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLogController } from './event-log.controller';
import { EventLogService } from './event-log.service';

@Module({
    imports: [TypeOrmModule.forFeature([])],
    controllers: [EventLogController],
    providers: [EventLogService],
    exports: [EventLogService]
})
export class EventLogModule {}
