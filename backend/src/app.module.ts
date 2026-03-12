import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { databaseConfig } from './config/database.config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { LoginActivitiesModule } from './login-activities/login-activities.module';
import { PaymentGatewaysModule } from './payment-gateways/payment-gateways.module';
import { CouponsModule } from './coupons/coupons.module';
import { TicketsModule } from './tickets/tickets.module';
import { MessagesModule } from './messages/messages.module';
import { TransactionsModule } from './transactions/transactions.module';
import { OrdersModule } from './orders/orders.module';
import { PaypalModule } from 'src/paypal/paypal.module';
import { ConfigModule } from '@nestjs/config';
import { OrderItemModule } from './order-items/order-item.module';
import { User } from './users/entities/user.entity';
import { Admin } from './admin/entities/admin.entity';
import { Category } from './categories/entities/category.entity';
import { Coupon } from './coupons/entities/coupon.entity';
import { OrderItem } from './order-items/entities/order-item.entity';
import { Order } from './orders/entities/order.entity';
import { Location } from './locations/entity/location.entity';
import { LoginActivity } from './login-activities/entities/login-activity.entity';
import { PaymentGateway } from './payment-gateways/entities/payment-gateway.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { Message } from './messages/entities/message.entity';
import { UtilityModule } from './utility/utility.module';
import { ProductsModule } from './products/products.module';
import { Favorite } from './favorites/entity/favorites.entity';
import { FavoriteModule } from './favorites/favorites.module';
import { LocationModule } from './locations/locations.module';
import { PaymentModule } from './payment/payment.module';
import { CartModule } from './cart/cart.module';
import { StripeModuel } from './stripe/stripe.module';
import { LemonModule } from './lemon/lemon.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { Role } from './role/entity/role.entity';
import { Menu } from './role/entity/menu.entity';
import { RoleMenu } from './role/entity/role_menu.entity';
import { RoleMenuModule } from './role/role_menu.module';
import { Setting } from './settings/entity/setting.entity';
import { JobsModule } from './jobs/jobs.module';
import { SettingModule } from './settings/setting.module';
import { Permission } from './permission/entity/permission.entity';
import { RolePermission } from './permission/entity/role_permission.entity';
import { AdminPermission } from './permission/entity/admin_permission.entity';
import { PermissionModule } from './permission/permission.module';
import { Log } from './system_log/entity/log.entity';
import { LogModule } from './system_log/log.module';
import { Pay2sModule } from './pay2s/pay2s.module';
import { StarPayModule } from './star_pay/star_pay.module';
import { IpModule } from './ip/ip.module';
import { Ip } from './ip/entity/ip.entity';
import { ExchangeRate } from './exchange/entity/exchange.entity';
import { ExchangeRateModule } from './exchange/exchange.module';
import { NotificationModule } from './notification/notification.module';
import { TwoFactorAuthenticationModule } from './2fa/2fa.module';
import { HeaderModule } from './header/header.module';
import { EventModule } from './event/event.module';
import { LuckyWheelModule } from './lucky_wheel/wheel.module';
import { EventLogModule } from './event_log/event-log.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(databaseConfig),
        TypeOrmModule.forFeature([
            User,
            Admin,
            Category,
            Coupon,
            OrderItem,
            Order,
            Location,
            LoginActivity,
            PaymentGateway,
            Ticket,
            Transaction,
            Message,
            Favorite,
            Role,
            Menu,
            RoleMenu,
            Setting,
            Permission,
            RolePermission,
            AdminPermission,
            Log,
            Ip,
            ExchangeRate
        ]),
        AdminModule,
        AuthModule,
        UsersModule,
        CategoriesModule,
        LoginActivitiesModule,
        PaymentGatewaysModule,
        CouponsModule,
        TicketsModule,
        MessagesModule,
        TransactionsModule,
        OrdersModule,
        PaypalModule,
        OrderItemModule,
        UtilityModule,
        ProductsModule,
        FavoriteModule,
        LocationModule,
        PaymentModule,
        CartModule,
        StripeModuel,
        LemonModule,
        DashboardModule,
        RoleMenuModule,
        JobsModule,
        SettingModule,
        PermissionModule,
        LogModule,
        Pay2sModule,
        StarPayModule,
        IpModule,
        ExchangeRateModule,
        NotificationModule,
        TwoFactorAuthenticationModule,
        HeaderModule,
        EventModule,
        LuckyWheelModule,
        EventLogModule,
        PaymentGatewaysModule,
        ConfigModule.forRoot({
            isGlobal: true
        })
    ],
    controllers: [AppController],
    providers: []
})
export class AppModule {}
