import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminModule } from '../admin/admin.module';
import { UsersModule } from '../users/users.module';
import { jwtConfig } from '../config/jwt.config';
import { LoginActivitiesModule } from '../login-activities/login-activities.module';
import { RoleMenuModule } from 'src/role/role_menu.module';
import { UtilityModule } from 'src/utility/utility.module';
import { IpModule } from 'src/ip/ip.module';
import { TwoFactorAuthenticationModule } from 'src/2fa/2fa.module';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
    imports: [
        AdminModule,
        forwardRef(() => UsersModule),
        PassportModule,
        LoginActivitiesModule,
        RoleMenuModule,
        UtilityModule,
        IpModule,
        TwoFactorAuthenticationModule,
        forwardRef(() => JobsModule),
        JwtModule.register({
            secret: jwtConfig.secret,
            signOptions: { expiresIn: jwtConfig.expiresIn }
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule {}
