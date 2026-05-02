import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { RoleType } from 'src/role/enum/role.enum';
import { User } from 'src/users/entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
    TransactionDirection,
    TransactionMethod,
    TransactionStatus,
    TransactionType
} from './enum/transactions.enum';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { UserMode } from 'src/users/enum/user.enum';
import { SearchTransactionDto } from './dto/search-transaction.dto';

@Injectable()
export class AdminTransactionService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly dataSource: DataSource
    ) {}

    async getOverviewData(type: TransactionType) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const [total, todayStats, success, failed] = await Promise.all([
            // 总交易金额
            this.transactionRepo
                .createQueryBuilder('t')
                .leftJoinAndSelect('t.user', 'u')
                .where('t.type = :type', { type })
                .andWhere('u.mode = :mode', { mode: UserMode.LIVE })
                .andWhere('t.status = :success', {
                    success: TransactionStatus.COMPLETED
                })
                .select('SUM(t.amount)', 'totalAmount')
                .addSelect('COUNT(*)', 'totalCount')
                .getRawOne(),

            // 今日总交易
            this.transactionRepo
                .createQueryBuilder('t')
                .leftJoinAndSelect('t.user', 'u')
                .where('t.type = :type', { type })
                .andWhere('t.createdAt >= :today', { today })
                .andWhere('u.mode = :mode', { mode: UserMode.LIVE })
                .andWhere('t.status = :success', {
                    success: TransactionStatus.COMPLETED
                })
                .select('SUM(t.amount)', 'todayAmount')
                .addSelect('COUNT(*)', 'todayCount')
                .getRawOne(),

            // 本月未完成交易
            this.transactionRepo
                .createQueryBuilder('t')
                .leftJoinAndSelect('t.user', 'u')
                .where('t.type = :type', { type })
                .andWhere('u.mode = :mode', { mode: UserMode.LIVE })
                .andWhere('t.status = :success', {
                    success: TransactionStatus.COMPLETED
                })
                .andWhere('t.createdAt BETWEEN :start AND :end', {
                    start: startOfMonth,
                    end: endOfMonth
                })
                .select('SUM(t.amount)', 'successAmount')
                .addSelect('COUNT(*)', 'successCount')
                .getRawOne(),

            // 本月已失败交易
            this.transactionRepo
                .createQueryBuilder('t')
                .leftJoinAndSelect('t.user', 'u')
                .where('t.type = :type', { type })
                .andWhere('u.mode = :mode', { mode: UserMode.LIVE })
                .andWhere('t.status = :failed', {
                    failed: TransactionStatus.CANCELLED
                })
                .andWhere('t.createdAt BETWEEN :start AND :end', {
                    start: startOfMonth,
                    end: endOfMonth
                })
                .select('SUM(t.amount)', 'failedAmount')
                .addSelect('COUNT(*)', 'failedCount')
                .getRawOne()
        ]);

        return {
            totalAmount: +total.totalAmount || 0,
            totalCount: +total.totalCount || 0,
            todayAmount: +todayStats.todayAmount || 0,
            todayCount: +todayStats.todayCount || 0,
            successAmount: +success.successAmount || 0,
            successCount: +success.successCount || 0,
            failedAmount: +failed.failedAmount || 0,
            failedCount: +failed.failedCount || 0
        };
    }

    async getTransactions(
        adminId: number,
        dto: SearchTransactionDto
    ): Promise<{
        data: Transaction[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const skip = (dto.page - 1) * dto.limit;
        const query = this.transactionRepo
            .createQueryBuilder('transaction')
            .leftJoin('transaction.order', 'order')
            .leftJoin('transaction.user', 'user')
            .leftJoin('user.parent', 'parent')
            .select([
                'transaction.id',
                'transaction.amount',
                'transaction.direction',
                'transaction.method',
                'transaction.hybridMethod',
                'transaction.type',
                'transaction.status',
                'transaction.postBalance',
                'transaction.transactionNumber',
                'transaction.reference',
                'transaction.remark',
                'transaction.proofImage',
                'transaction.proofImageUrl',
                'transaction.currency',
                'transaction.beforeBalance',
                'transaction.afterBalance',
                'transaction.processedAt',
                'transaction.createdAt',
                'order.id',
                'user.id',
                'user.email',
                'user.mode',
                'parent.id',
                'parent.name'
            ]);
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });

        if (!admin) throw new UnauthorizedException();

        if (admin.role.name === RoleType.TEAM) {
            // 查找这些 team 注册的用户 id（user.parent = team）
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });
            const userIds = users.map((u) => u.id);

            if (userIds.length > 0) {
                query.andWhere('transaction.userId IN (:...userIds)', {
                    userIds
                });
            } else {
                query.andWhere('1 = 0'); // 没有匹配的用户，不返回订单
            }
        }

        if (admin.role.name === RoleType.AGENT) {
            // 查找 agent 底下的 team 的所有 id（如果你想精确控制）
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);

            // 查找这些 team 注册的用户 id（user.parent = team）
            const users = await this.userRepo.find({
                where: {
                    parent: { id: In(teamIds) }
                },
                select: ['id']
            });
            const userIds = users.map((u) => u.id);

            if (userIds.length > 0) {
                query.andWhere('transaction.userId IN (:...userIds)', {
                    userIds
                });
            } else {
                query.andWhere('1 = 0'); // 没有匹配的用户，不返回订单
            }
        }

        if (dto.transactionId)
            query.andWhere('transaction.id = :transactionId', {
                transactionId: dto.transactionId
            });
        if (dto.email)
            query.andWhere('user.email LIKE :email', {
                email: `%${dto.email}%`
            });
        if (dto.mode !== undefined)
            query.andWhere('user.mode = :mode', { mode: dto.mode });
        if (dto.parentId)
            query.andWhere('parent.id = :parentId', { parentId: dto.parentId });
        // 金额区间
        if (dto.balanceGreaterThan)
            query.andWhere('transaction.amount >= :balanceGreaterThan', {
                balanceGreaterThan: parseFloat(dto.balanceGreaterThan)
            });
        if (dto.balanceLessThan)
            query.andWhere('transaction.amount <= :balanceLessThan', {
                balanceLessThan: parseFloat(dto.balanceLessThan)
            });
        // 时间范围
        if (dto.fromDate)
            query.andWhere('transaction.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('transaction.createdAt <= :toDate', {
                toDate: dto.toDate
            });
        if (dto.type !== undefined)
            query.andWhere('transaction.type = :type', { type: dto.type });
        if (dto.direction !== undefined)
            query.andWhere('transaction.direction = :direction', {
                direction: dto.direction
            });
        if (dto.method !== undefined)
            query.andWhere('transaction.method = :method', {
                method: dto.method
            });
        if (dto.hybridMethod !== undefined)
            query.andWhere('transaction.hybridMethod = :hybridMethod', {
                hybridMethod: dto.hybridMethod
            });
        if (dto.status !== undefined)
            query.andWhere('transaction.status = :status', {
                status: dto.status
            });

        const sortFieldMap = {
            actions: 'transaction.id',
            'order.id': 'order.id',
            'parent.name': 'parent.name',
            'user.email': 'user.email',
            'user.mode': 'user.mode',
        };

        const sortField =
            sortFieldMap[dto.sortBy] ?? `transaction.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const transactions = {
            overview: await this.getOverviewData(dto.type),
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return transactions;
    }

    async createTransaction(dto: CreateTransactionDto) {
        const user = await this.userRepo.findOne({ where: { id: dto.userId } });
        if (!user) {
            throw new NotFoundException(`User ID ${dto.userId} not found`);
        }

        const before = parseFloat(user.balance).toFixed(2);
        const transactionNumber =
            dto.transactionNumber ??
            `ST-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

        const transaction = this.transactionRepo.create({
            user: { id: dto.userId },
            amount: dto.amount,
            direction: TransactionDirection.IN,
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.PENDING,
            postBalance: user.balance,
            beforeBalance: before,
            method: TransactionMethod.STRIPE,
            hybridMethod: TransactionMethod.STRIPE,
            transactionNumber,
            currency: 'EUR'
        });

        return await this.transactionRepo.save(transaction);
    }

    async approveBankDeposit(
        adminId: number,
        transactionId: number
    ): Promise<Transaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const transaction = await queryRunner.manager.findOne(Transaction, {
                where: { id: transactionId },
                relations: ['user']
            });
            if (!transaction) {
                throw new NotFoundException(
                    `Transaction ${transactionId} not found`
                );
            }
            if (transaction.status !== TransactionStatus.PENDING) {
                throw new BadRequestException('Transaction is not pending');
            }
            if (transaction.type !== TransactionType.DEPOSIT) {
                throw new BadRequestException('Not a deposit transaction');
            }
            if (transaction.method !== TransactionMethod.BANK_TRANSFER) {
                throw new BadRequestException(
                    'Only bank transfer deposits can be approved here'
                );
            }

            const user = await queryRunner.manager
                .createQueryBuilder(User, 'user')
                .setLock('pessimistic_write')
                .where('user.id = :id', { id: transaction.user.id })
                .getOne();
            if (!user) {
                throw new NotFoundException(`User not found`);
            }

            const before = parseFloat(user.balance).toFixed(2);
            transaction.beforeBalance = transaction.beforeBalance ?? before;
            user.balance = (
                parseFloat(user.balance) + parseFloat(transaction.amount)
            ).toFixed(2);
            transaction.afterBalance = user.balance;
            transaction.postBalance = user.balance;
            transaction.status = TransactionStatus.COMPLETED;
            transaction.processedAt = new Date();
            transaction.processedBy = { id: adminId } as Admin;

            await queryRunner.manager.save(user);
            await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();
            return transaction;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async rejectBankDeposit(
        adminId: number,
        transactionId: number,
        reason?: string
    ): Promise<Transaction> {
        const transaction = await this.transactionRepo.findOne({
            where: { id: transactionId },
            relations: ['user']
        });
        if (!transaction) {
            throw new NotFoundException(`Transaction ${transactionId} not found`);
        }
        if (transaction.status !== TransactionStatus.PENDING) {
            throw new BadRequestException('Transaction is not pending');
        }
        if (transaction.method !== TransactionMethod.BANK_TRANSFER) {
            throw new BadRequestException(
                'Only bank transfer deposits can be rejected here'
            );
        }

        transaction.status = TransactionStatus.CANCELLED;
        transaction.processedAt = new Date();
        transaction.processedBy = { id: adminId } as Admin;
        if (reason) {
            transaction.remark = transaction.remark
                ? `${transaction.remark}\n[Rejected] ${reason}`
                : `[Rejected] ${reason}`;
        }
        return this.transactionRepo.save(transaction);
    }

    async adjustBalance(
        adminId: number,
        dto: AdjustBalanceDto
    ): Promise<Transaction> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager
                .createQueryBuilder(User, 'user')
                .setLock('pessimistic_write')
                .where('user.id = :id', { id: dto.userId })
                .getOne();
            if (!user) {
                throw new NotFoundException(`User ID ${dto.userId} not found`);
            }

            const amt = Number(dto.amount).toFixed(2);
            const before = parseFloat(user.balance).toFixed(2);
            let after: string;

            if (dto.direction === TransactionDirection.IN) {
                after = (parseFloat(user.balance) + parseFloat(amt)).toFixed(2);
                user.balance = after;
            } else {
                if (parseFloat(user.balance) < parseFloat(amt)) {
                    throw new BadRequestException('Insufficient balance');
                }
                after = (parseFloat(user.balance) - parseFloat(amt)).toFixed(2);
                user.balance = after;
            }

            const tx = queryRunner.manager.create(Transaction, {
                user: { id: dto.userId },
                transactionNumber: `ADJ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                amount: amt,
                direction: dto.direction,
                method: TransactionMethod.BALANCE,
                hybridMethod: TransactionMethod.BALANCE,
                type: TransactionType.ADJUSTMENT,
                status: TransactionStatus.COMPLETED,
                postBalance: after,
                beforeBalance: before,
                afterBalance: after,
                remark: dto.remark,
                currency: 'EUR',
                processedAt: new Date(),
                processedBy: { id: adminId } as Admin
            });

            await queryRunner.manager.save(user);
            await queryRunner.manager.save(tx);
            await queryRunner.commitTransaction();
            return tx;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}

