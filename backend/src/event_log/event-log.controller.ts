import { Controller, UseGuards } from '@nestjs/common';
import { EventLogService } from './event-log.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('event-logs')
export class EventLogController {
    constructor(private readonly eventLogService: EventLogService) {}
}
