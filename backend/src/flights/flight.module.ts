import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { User } from 'src/users/entities/user.entity';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { FlightBooking } from './entities/flight-booking.entity';
import { AdminFlightService } from './flight.admin.service';
import { AdminFlightController } from './flight.admin.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([FlightBooking, User, Admin]), NotificationModule],
  controllers: [FlightController, AdminFlightController],
  providers: [FlightService, AdminFlightService],
  exports:[FlightService, AdminFlightService]
})
export class FlightModule {}
