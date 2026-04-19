import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminFlightService } from './flight.admin.service';
import { SearchFlightBookingDto } from './dto/search-flight-booking.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/flight-bookings')
@Controller('admin/flight-bookings')
export class AdminFlightController {
    constructor(private readonly adminFlightService: AdminFlightService) {}

    @Post('get-all-flight-bookings')
    getAllFlightBookings(
        @Req() req: Request,
        @Body() dto: SearchFlightBookingDto
    ) {
        const adminId = (req as any)?.user.id;
        return this.adminFlightService.getAllFlightBookings(adminId, dto);
    }
}
