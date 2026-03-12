import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entity/location.entity';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Location]), UsersModule],
    controllers: [LocationsController],
    providers: [LocationsService],
    exports: [LocationsService, TypeOrmModule]
})
export class LocationModule {}
