import { Module } from '@nestjs/common';
import { TwoFactorAuthenticationController } from './2fa.controller';
import { TwoFactorAuthenticationService } from './2fa.service';
import { CacheModule } from '@nestjs/cache-manager';
import { UtilityModule } from 'src/utility/utility.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Admin]),
        UtilityModule,
        CacheModule.register({
            store: 'memory',
            ttl: 300 // 秒
        })
    ],
    controllers: [TwoFactorAuthenticationController],
    providers: [TwoFactorAuthenticationService],
    exports: [TwoFactorAuthenticationService]
})
export class TwoFactorAuthenticationModule {}
