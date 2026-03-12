import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginActivitiesService } from './login-activities.service';
import { LoginActivitiesController } from './login-activities.controller';
import { LoginActivity } from './entities/login-activity.entity';
import { AdminModule } from 'src/admin/admin.module';
import { IpModule } from 'src/ip/ip.module';

@Module({
    imports: [TypeOrmModule.forFeature([LoginActivity]), AdminModule, IpModule],
    controllers: [LoginActivitiesController],
    providers: [LoginActivitiesService],
    exports: [LoginActivitiesService]
})
export class LoginActivitiesModule {}
