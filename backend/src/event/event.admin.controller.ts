import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventAdminService } from "./event.admin.service";
import { SearchEventDto } from "./dto/search-event.dto";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('admin/events')
export class EventAdminController {
    constructor(private readonly eventService: EventAdminService) {}

    @Post('create-event')
    createEvent(@Req() req: Request, @Body() dto: CreateEventDto) {
        const adminId = (req as any)?.user.id;
        return this.eventService.createEvent(adminId, dto, req);
    }

    @Post('get-all-events')
    getAllEvents(@Req() req: Request, @Body() dto: SearchEventDto){
        const adminId = (req as any)?.user.id;
        return this.eventService.getAllEvents(adminId, dto);
    }
}
