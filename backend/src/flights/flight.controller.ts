import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FlightService } from './flight.service';
import { SearchFlightDto } from './dto/search-flight.dto';
import { CreateFlightBookingDto } from './dto/create-flight-booking.dto';

@ApiTags('flights')
@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Post('search')
  async search(@Body() body: SearchFlightDto) {
    return this.flightService.searchFlights(body);
  }

  @Post('create-booking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  createBooking(@Req() req: Request, @Body() body: CreateFlightBookingDto) {
    const userId = (req as any)?.user.id;
    return this.flightService.createBooking(userId, body);
  }

  @Post('get-all-booking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  getAllBooking(@Req() req: Request) {
    const userId = (req as any)?.user.id;
    return this.flightService.getAllFlightBooking(userId);
  }
}
