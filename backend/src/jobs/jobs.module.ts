import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrderProcessor } from 'src/orders/orders.process';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from 'src/orders/orders.module';
import * as dotenv from 'dotenv';
import { TransactionProcessor } from 'src/transactions/transactions.process';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { JobsQueue } from './jobs.queue';
import { AuthProcessor } from 'src/auth/auth.processor';
import { AuthModule } from 'src/auth/auth.module';

const debug = true;
dotenv.config({ path: debug ? '.env.dev' : '.env' });

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD
            }
        }),
        BullModule.registerQueue(
            {
                name: 'order'
            },
            {
                name: 'transaction'
            },
            {
                name: 'auth'
            }
        ),
        TypeOrmModule.forFeature([]),
        forwardRef(() => OrdersModule),
        forwardRef(() => TransactionsModule),
        forwardRef(() => AuthModule)
    ],
    providers: [JobsQueue, OrderProcessor, TransactionProcessor, AuthProcessor],
    exports: [
        JobsQueue,
        BullModule,
        BullModule.registerQueue(
            { name: 'order' },
            { name: 'transaction' },
            {
                name: 'auth'
            }
        )
    ]
})
export class JobsModule {}
