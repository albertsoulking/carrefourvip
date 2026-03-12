import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entity/products.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Order } from 'src/orders/entities/order.entity';
import { UsersModule } from 'src/users/users.module';
import { ExchangeRate } from 'src/exchange/entity/exchange.entity';
import { IpModule } from 'src/ip/ip.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Cart, User, Product, Order, ExchangeRate]),
        UsersModule,
        IpModule,
        NotificationModule
    ],
    providers: [CartService],
    controllers: [CartController],
    exports: [CartService]
})
export class CartModule {}
