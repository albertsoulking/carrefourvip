import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { User } from 'src/users/entities/user.entity';
import { AdminTransactionController } from './transactions.admin.controller';
import { AdminTransactionService } from './transactions.admin.service';
import { Admin } from 'src/admin/entities/admin.entity';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, User, Admin]),
        forwardRef(() => JobsModule)
    ],
    controllers: [TransactionsController, AdminTransactionController],
    providers: [TransactionsService, AdminTransactionService],
    exports: [TransactionsService, AdminTransactionService]
})
export class TransactionsModule {}
