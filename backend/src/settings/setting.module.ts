import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entity/setting.entity';
import { SettingService } from './setting.service';
import { AdminSettingController } from './setting.admin.controller';
import { SettingController } from './setting.controller';
import { Admin } from 'src/admin/entities/admin.entity';
import { LogModule } from 'src/system_log/log.module';
import { SettingAdminService } from './setting.admin.service';

@Module({
    imports: [TypeOrmModule.forFeature([Setting, Admin]), LogModule],
    controllers: [SettingController, AdminSettingController],
    providers: [SettingService, SettingAdminService],
    exports: [SettingService, SettingAdminService, TypeOrmModule]
})
export class SettingModule {}
