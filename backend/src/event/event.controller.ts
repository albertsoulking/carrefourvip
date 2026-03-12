import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { EventService } from "./event.service";
import { UpdateEventDto } from "./dto/update-event.dto";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Post('get-all-events')
    getAll(@Req() req: Request) {
        const userId = (req as any)?.user.id;
        return this.eventService.getAll(userId);
    }

    @Post('get-one-event')
    getOne(@Req() req: Request, @Body('id') id: string) {
        const userId = (req as any)?.user.id;
        return this.eventService.getOne(userId, +id);
    }

    @Post('get-event-result')
    getResult(@Req() req: Request, @Body('id') id: string) {
        const userId = (req as any)?.user.id;
        return this.eventService.getResult(userId, +id);
    };

    @Post('set-event-result')
    setResult(@Req() req: Request, @Body() dto: UpdateEventDto) {
        const userId = (req as any)?.user.id;
        return this.eventService.setResult(userId, dto);
    }

    @Post('claim-event-reward')
    claimReward(@Req() req:Request, @Body('rewardId') rewardId: number) {
        const userId = (req as any)?.user.id
        return this.eventService.claimReward(userId, rewardId);
    }
}
