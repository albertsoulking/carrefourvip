import {
    Controller,
    Post,
    UseGuards,
    Body,
    Req
} from '@nestjs/common';
import { LoginActivitiesService } from './login-activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiTags,
    ApiBearerAuth
} from '@nestjs/swagger';
import { Request } from 'express';
import { SearchLoginActivityDto } from './dto/search-login-activity.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/login-activities')
@Controller('admin/login-activities')
export class LoginActivitiesController {
    constructor(
        private readonly loginActivitiesService: LoginActivitiesService
    ) {}

    @Post('get-login-activities')
    getAll(
        @Req() req: Request,
        @Body() dto: SearchLoginActivityDto
    ) {
        const adminId = (req as any)?.user.id;
        return this.loginActivitiesService.getAll(
            adminId,
            dto
        );
    }
}
