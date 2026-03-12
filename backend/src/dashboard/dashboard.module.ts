import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entity/products.entity';
import { User } from 'src/users/entities/user.entity';
import { AdminDashboardController } from './dashboard.admin.controller';
import { AdminDashboardService } from './dashboard.admin.service';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { AdminModule } from 'src/admin/admin.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, User, Product, OrderItem, Admin]),
        AdminModule
    ],
    controllers: [AdminDashboardController],
    providers: [AdminDashboardService],
    exports: [AdminDashboardService]
})
export class DashboardModule {}
