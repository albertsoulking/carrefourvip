import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';
import {
    TransactionDirection,
    TransactionMethod,
    TransactionStatus,
    TransactionType
} from './enum/transactions.enum';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateUserDepositDto } from './dto/create-user-deposit.dto';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepo: Repository<Transaction>,
        private dataSource: DataSource,
        @InjectRepository(User)
        private userRepo: Repository<User>
    ) {}

    private genTxnNo(prefix: string): string {
        return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    async createUserDeposit(
        userId: number,
        dto: CreateUserDepositDto
    ): Promise<Transaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager
                .createQueryBuilder(User, 'user')
                .setLock('pessimistic_write')
                .where('user.id = :id', { id: userId })
                .getOne();
            if (!user) {
                throw new NotFoundException(`User ID ${userId} not found`);
            }

            const amountStr = Number(dto.amount).toFixed(2);
            const before = parseFloat(user.balance).toFixed(2);

            const proofName = dto.proofImage?.trim();
            if (!proofName) {
                throw new BadRequestException('Payment proof image is required');
            }

            const base = (process.env.HOST_BASE_URL || '').replace(/\/$/, '');
            const proofImageUrl =
                dto.proofImageUrl?.trim() ||
                (base ? `${base}/uploads/images/${proofName}` : null);
            if (!proofImageUrl) {
                throw new BadRequestException(
                    'proofImageUrl is required (or configure HOST_BASE_URL on the server)'
                );
            }

            const tx = queryRunner.manager.create(Transaction, {
                user: { id: userId },
                transactionNumber: this.genTxnNo('DP-'),
                amount: amountStr,
                direction: TransactionDirection.IN,
                method: TransactionMethod.BANK_TRANSFER,
                hybridMethod: TransactionMethod.BANK_TRANSFER,
                type: TransactionType.DEPOSIT,
                status: TransactionStatus.PENDING,
                postBalance: before,
                beforeBalance: before,
                afterBalance: null,
                reference: dto.reference ?? null,
                remark: dto.remark ?? null,
                proofImage: proofName,
                proofImageUrl,
                currency: 'EUR'
            });

            const saved = await queryRunner.manager.save(tx);
            await queryRunner.commitTransaction();
            return saved;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findOneMine(userId: number, id: number): Promise<Transaction> {
        const transaction = await this.transactionRepo.findOne({
            where: { id, user: { id: userId } },
            relations: ['user']
        });
        if (!transaction) {
            throw new NotFoundException(`Transaction ${id} not found`);
        }
        return transaction;
    }

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
                'transaction.method',
                'transaction.postBalance',
                'transaction.transactionNumber',
                'transaction.reference',
                'transaction.remark',
                'transaction.proofImage',
                'transaction.proofImageUrl',
                'transaction.currency',
                'transaction.beforeBalance',
                'transaction.afterBalance',
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

            if (
                dto.status === TransactionStatus.COMPLETED &&
                transaction.method === TransactionMethod.BANK_TRANSFER &&
                transaction.type === TransactionType.DEPOSIT
            ) {
                throw new ForbiddenException(
                    'Bank transfer deposits are approved by administrators only'
                );
            }

            if (
                dto.status === TransactionStatus.COMPLETED &&
                transaction.status === TransactionStatus.PENDING
            ) {
                const user = await queryRunner.manager
                    .createQueryBuilder(User, 'user')
                    .setLock('pessimistic_write')
                    .where('user.id = :id', { id: transaction.user.id })
                    .getOne();
                if (!user) {
                    throw new NotFoundException(
                        `User ID ${transaction.user.id} not  found!`
                    );
                }

                const before = parseFloat(user.balance).toFixed(2);
                transaction.beforeBalance =
                    transaction.beforeBalance ?? before;

                user.balance = (
                    parseFloat(user.balance) + parseFloat(transaction.amount)
                ).toFixed(2);
                transaction.afterBalance = user.balance;
                transaction.postBalance = user.balance;
                transaction.status = dto.status;
                await queryRunner.manager.save(user);
            }

            if (
                dto.status === TransactionStatus.CANCELLED &&
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
