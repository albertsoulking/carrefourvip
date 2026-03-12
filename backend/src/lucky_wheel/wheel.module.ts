import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LuckyWheelController } from './wheel.controller';
import { LuckyWheelService } from './wheel.service';
import { LuckyWheel } from './entity/wheel.entity';
import { LogModule } from 'src/system_log/log.module';
import { Admin } from 'src/admin/entities/admin.entity';

@Module({
    imports: [TypeOrmModule.forFeature([LuckyWheel, Admin]), LogModule],
    controllers: [LuckyWheelController],
    providers: [LuckyWheelService],
    exports: [LuckyWheelService]
})
export class LuckyWheelModule {}
