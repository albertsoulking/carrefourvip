import { Body, Controller, Post, Req } from '@nestjs/common';
import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { Request } from 'express';
import { SearchLogDto } from './dto/search-log.dto';

@Controller('admin/system-log')
export class LogController {
    constructor(private readonly logService: LogService) {}

    @Post('create-log')
    create(@Req() req: Request, @Body() dto: CreateLogDto) {
        return this.logService.logAdminAction(req, dto);
    }

    @Post('get-logs')
    getAll(@Body() dto: SearchLogDto) {
        return this.logService.getAll(dto);
    }
}
