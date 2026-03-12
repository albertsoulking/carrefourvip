import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AdminModule } from '../admin/admin.module';
import { MessagesModule } from '../messages/messages.module';
import { Favorite } from 'src/favorites/entity/favorites.entity';
import { AdminUserService } from './users.admin.service';
import { AdminUserController } from './users.admin.controller';
import { RoleMenuModule } from 'src/role/role_menu.module';
import { UtilityModule } from 'src/utility/utility.module';
import { LogModule } from 'src/system_log/log.module';
import { Admin } from 'src/admin/entities/admin.entity';
import { Role } from 'src/role/entity/role.entity';
import { IpModule } from 'src/ip/ip.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Favorite, Admin, Role]),
        AdminModule,
        RoleMenuModule,
        forwardRef(() => MessagesModule),
        UtilityModule,
        LogModule,
        IpModule,
        NotificationModule
    ],
    controllers: [UsersController, AdminUserController],
    providers: [UsersService, AdminUserService],
    exports: [UsersService, AdminUserService, TypeOrmModule]
})
export class UsersModule {}
