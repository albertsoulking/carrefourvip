import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';
import { TransactionStatus } from './enum/transactions.enum';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepo: Repository<Transaction>,
        private dataSource: DataSource,
        @InjectRepository(User)
        private userRepo: Repository<User>
    ) {}

    async findMyTransactions(
        userId: number,
        page: number,
        limit: number,
        type: number
    ): Promise<{
        data: Transaction[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const skip = (page - 1) * limit;

        const query = this.transactionRepo
            .createQueryBuilder('transaction')
            .leftJoin('transaction.user', 'user')
            .select([
                'transaction.id',
                'transaction.amount',
                'transaction.direction',
                'transaction.status',
                'transaction.type',
                'transaction.postBalance',
                'transaction.createdAt',
                'user.id',
                'user.name'
            ])
            .where('transaction.userId = :userId', { userId });

        let transactionType: string[] = [];
        let transactionStatus: string[] = [];

        switch (type) {
            case 0: // Order Payment
                transactionType = ['order_payment'];
                break;
            case 1: // Deposit
                transactionType = ['deposit'];
                break;
            case 2: // Refund
                transactionType = ['order_payment'];
                transactionStatus = ['refunded'];
                break;
            default:
                break;
        }

        // 添加筛选
        if (transactionType.length > 0) {
            query.andWhere('transaction.type IN (:...transactionType)', {
                transactionType
            });
        }
        if (transactionStatus.length > 0) {
            query.andWhere('transaction.status IN (:...transactionStatus)', {
                transactionStatus
            });
        }

        const [data, total] = await query
            .skip(skip)
            .take(limit)
            .orderBy('transaction.id', 'DESC')
            .getManyAndCount();

        const transactions = {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit)
        };

        return transactions;
    }

    async updateOneTransaction(
        dto: UpdateTransactionDto
    ): Promise<{ status: TransactionStatus }> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const transaction = await queryRunner.manager.findOne(Transaction, {
                where: { id: dto.id },
                relations: ['user']
            });
            if (!transaction) {
                throw new NotFoundException(
                    `Transaction with ID ${dto.id} not found`
                );
            }

            if (dto.status === TransactionStatus.COMPLETED &&
                transaction.status === TransactionStatus.PENDING
            ) {
                const user = await this.userRepo.findOne({
                    where: { id: transaction.user.id }
                });
                if (!user) {
                    throw new NotFoundException(`User ID ${transaction.user.id} not  found!`);
                }

                user.balance = (
                    parseFloat(user.balance) + parseFloat(transaction.amount)
                ).toFixed(2);
                await queryRunner.manager.save(user);

                transaction.status = dto.status;
                transaction.postBalance = user.balance;
            }

            if (dto.status === TransactionStatus.CANCELLED &&
                transaction.status === TransactionStatus.PENDING
            ) {
                transaction.status = dto.status;
            }

            await queryRunner.manager.save(transaction);

            await queryRunner.commitTransaction();
            return { status: transaction.status };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
