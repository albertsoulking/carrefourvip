import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LuckyWheelService } from './wheel.service';
import { Request } from 'express';
import { CreateLuckyWheelDto } from './dto/create-wheel.dto';
import { SearchLuckyWheelDto } from './dto/search-wheel.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('admin/lucky-wheel')
export class LuckyWheelController {
    constructor(private readonly luckyWheelService: LuckyWheelService) {}

    @Post('create-lucky-wheel')
    create(@Req() req: Request, @Body() dto: CreateLuckyWheelDto) {
        const adminId = (req as any)?.user.id;
        return this.luckyWheelService.create(adminId, dto, req);
    }

    @Post('get-all-lucky-wheels')
    getAll(@Req() req: Request, @Body() dto: SearchLuckyWheelDto) {
        const adminId = (req as any)?.user.id;
        return this.luckyWheelService.getAll(adminId, dto);
    }

    @Post('find-all-lucky-wheels')
    findAll(@Req() req: Request) {
        const adminId = (req as any)?.user.id;
        return this.luckyWheelService.findAll(adminId);
    }
}
