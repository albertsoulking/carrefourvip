import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { Role } from 'src/role/entity/role.entity';
import { UtilityModule } from 'src/utility/utility.module';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import { LogModule } from 'src/system_log/log.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Admin, Role, User, Order]),
        forwardRef(() => UtilityModule),
        LogModule,
        NotificationModule
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService, TypeOrmModule]
})
export class AdminModule {}
