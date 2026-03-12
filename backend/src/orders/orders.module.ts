import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { OrderItemService } from 'src/order-items/order-item.service';
import { Product } from 'src/products/entity/products.entity';
import { AdminOrderController } from './orders.admin.controller';
import { AdminOrderService } from './orders.admin.service';
import { Cart } from 'src/cart/entity/cart.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { JobsModule } from 'src/jobs/jobs.module';
import { SettingModule } from 'src/settings/setting.module';
import { AdminModule } from 'src/admin/admin.module';
import { LogModule } from 'src/system_log/log.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';
import { EventModule } from 'src/event/event.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Order,
            OrderItem,
            User,
            Coupon,
            Transaction,
            Product,
            Cart,
            Admin
        ]),
        forwardRef(() => JobsModule),
        SettingModule,
        AdminModule,
        LogModule,
        UsersModule,
        NotificationModule,
        EventModule
    ],
    controllers: [OrdersController, AdminOrderController],
    providers: [OrdersService, OrderItemService, AdminOrderService],
    exports: [OrdersService, AdminOrderService]
})
export class OrdersModule {}
