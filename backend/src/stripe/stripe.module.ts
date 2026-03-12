import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { OrdersModule } from 'src/orders/orders.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { SettingModule } from 'src/settings/setting.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        OrdersModule,
        TransactionsModule,
        JobsModule,
        SettingModule,
        UsersModule
    ],
    controllers: [StripeController],
    providers: [StripeService],
    exports: [StripeService]
})
export class StripeModuel {}
