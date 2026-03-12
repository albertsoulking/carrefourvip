import { forwardRef, Module } from '@nestjs/common';
import { UtilityController } from './utility.controller';
import { UtilityService } from './utility.service';
import { AdminModule } from 'src/admin/admin.module';
import { RoleMenuModule } from 'src/role/role_menu.module';
import { SettingModule } from 'src/settings/setting.module';
import { LogModule } from 'src/system_log/log.module';

@Module({
    imports: [
        forwardRef(() => AdminModule),
        RoleMenuModule,
        SettingModule,
        LogModule
    ],
    controllers: [UtilityController],
    providers: [UtilityService],
    exports: [UtilityService]
})
export class UtilityModule {}
