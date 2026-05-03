import {
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { User } from 'src/users/entities/user.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { RoleType } from 'src/role/enum/role.enum';
import {
    TransactionDirection,
    TransactionStatus,
    TransactionType
} from 'src/transactions/enum/transactions.enum';
import { UserMode } from 'src/users/enum/user.enum';
import { OrdersService } from './orders.service';
import { AdminService } from 'src/admin/admin.service';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { SearchOrderDto } from './dto/search-order.dto';
import { OrderStatus, PaymentStatus } from './enums/order.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { NotificationService } from 'src/notification/notification.service';
import { EventAdminService } from 'src/event/event.admin.service';
import { NotificationType } from 'src/notification/enum/notification.enum';
import { v4 as uuidv4 } from 'uuid';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { AdminCreateOrderDto } from './dto/admin-create-order.dto';
import { Setting } from 'src/settings/entity/setting.entity';
import { JobsQueue } from 'src/jobs/jobs.queue';

@Injectable()
export class AdminOrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>,
        private readonly jobsQueue: JobsQueue,
        private readonly dataSource: DataSource,
        private readonly orderService: OrdersService,
        private readonly adminService: AdminService,
        private readonly logService: LogService,
        private readonly notiService: NotificationService,
        private readonly adminEventService: EventAdminService
    ) {}

    async getOverviewData(admin: Admin) {
        // 总订单数
        let totalOrders = 0;
        let totalQuery = this.orderRepo
            .createQueryBuilder('order')
            .innerJoin('order.user', 'user')
            .where('order.paymentStatus = :paymentStatus', {
                paymentStatus: PaymentStatus.PAID
            });

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                totalQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                totalQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                totalQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                totalQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                totalQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                totalQuery.andWhere('1 = 0');
            }
        }

        totalOrders = await totalQuery.getCount();

        // 本月订单数
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        let monthlyOrders = 0;
        let monthlyQuery = this.orderRepo
            .createQueryBuilder('order')
            .innerJoin('order.user', 'user')
            .where('order.paymentStatus = :paymentStatus', {
                paymentStatus: PaymentStatus.PAID
            })
            .andWhere('order.createdAt >= :start', { start: startOfMonth })
            .andWhere('order.createdAt < :end', { end: endOfMonth });

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                monthlyQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                monthlyQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                monthlyQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                monthlyQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                monthlyQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                monthlyQuery.andWhere('1 = 0');
            }
        }

        monthlyOrders = await monthlyQuery.getCount();

        // 待处理订单
        let pendingOrders = 0;
        let pendingQuery = this.orderRepo
            .createQueryBuilder('order')
            .innerJoin('order.user', 'user')
            .where('order.paymentStatus = :paymentStatus', {
                paymentStatus: PaymentStatus.PENDING
            });

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                pendingQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                pendingQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                pendingQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                pendingQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                pendingQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                pendingQuery.andWhere('1 = 0');
            }
        }

        pendingOrders = await pendingQuery.getCount();

        //  总收入（支付成功的订单，金额是字符串）
        let totalRevenueResult: any = undefined;
        let revenueQuery = this.orderRepo
            .createQueryBuilder('order')
            .select('SUM(CAST(order.payAmount AS DECIMAL(10,2)))', 'total')
            .innerJoin('order.user', 'user')
            .where('order.paymentStatus = :paymentStatus', {
                paymentStatus: PaymentStatus.PAID
            });

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                revenueQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                revenueQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                revenueQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                revenueQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                revenueQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                revenueQuery.andWhere('1 = 0');
            }
        }

        totalRevenueResult = await revenueQuery.getRawOne();

        const totalRevenue = Number(totalRevenueResult?.total || 0);

        const overview = {
            totalOrders,
            monthlyOrders,
            pendingOrders,
            totalRevenue
        };

        return overview;
    }

    async getAllOrders(adminId: number, dto: SearchOrderDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const skip = (dto.page - 1) * dto.limit;
        const query = this.orderRepo
            .createQueryBuilder('order')
            .leftJoin('order.items', 'items')
            .leftJoin('items.product', 'product')
            .leftJoin('order.user', 'user')
            .leftJoin('user.parent', 'parent')
            .leftJoin('user.role', 'role')
            .select([
                'order.id',
                'order.imageUrl',
                'order.subtotal',
                'order.quantity',
                'order.vat',
                'order.deliveryFee',
                'order.totalPrice',
                'order.discountPayPal',
                'order.balanceDeduct',
                'order.payAmount',
                'order.payMethod',
                'order.hybridMethod',
                'order.status',
                'order.paymentStatus',
                'order.userName',
                'order.userMobile',
                'order.userAddress',
                'order.paymentLink',
                'order.shareLink',
                'order.deliveryMethod',
                'order.createdAt',
                'order.paidAt',
                'order.processingAt',
                'order.shippedAt',
                'order.deliveredAt',
                'order.cancelledAt',
                'order.refundedAt',
                'order.estimatedProcessingAt',
                'order.estimatedShippedAt',
                'order.estimatedDeliveredAt',
                'order.deliveryProofImages',
                'order.paymentProofImage',
                'items.id',
                'items.productImage',
                'items.productName',
                'items.quantity',
                'items.unitPrice',
                'items.totalPrice',
                'items.attributes',
                'product.id',
                'product.attributes',
                'user.id',
                'user.name',
                'user.phone',
                'user.email',
                'user.city',
                'user.state',
                'user.country',
                'user.mode',
                'parent.id',
                'parent.name'
            ]);
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

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
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0'); // 没有匹配的用户，不返回订单
            }
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0'); // 没有匹配的用户，不返回订单
            }
        }

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0'); // 没有匹配的用户，不返回订单
            }
        }

        if (dto.orderId)
            query.andWhere('order.id = :orderId', { orderId: dto.orderId });
        if (dto.email)
            query.andWhere('user.email LIKE :email', {
                email: `%${dto.email}%`
            });
        if (dto.parentId !== undefined)
            query.andWhere('parent.id = :parentId', { parentId: dto.parentId });
        if (dto.mode !== undefined)
            query.andWhere('user.mode = :mode', { mode: dto.mode });
        if (dto.deliveryMethod !== undefined)
            query.andWhere('order.deliveryMethod = :deliveryMethod', {
                deliveryMethod: dto.deliveryMethod
            });
        if (dto.payMethod !== undefined)
            query.andWhere('order.payMethod = :payMethod', {
                payMethod: dto.payMethod
            });
        if (dto.hybridMethod !== undefined)
            query.andWhere('order.hybridMethod = :hybridMethod', {
                hybridMethod: dto.hybridMethod
            });
        if (dto.status !== undefined)
            query.andWhere('order.status = :status', { status: dto.status });
        if (dto.paymentStatus !== undefined)
            query.andWhere('order.paymentStatus = :paymentStatus', {
                paymentStatus: dto.paymentStatus
            });
        // 金额区间（假设 user.balance 字段为 number）
        if (dto.balanceGreaterThan)
            query.andWhere('order.payAmount >= :balanceGreaterThan', {
                balanceGreaterThan: parseFloat(dto.balanceGreaterThan)
            });
        if (dto.balanceLessThan)
            query.andWhere('order.payAmount <= :balanceLessThan', {
                balanceLessThan: parseFloat(dto.balanceLessThan)
            });
        // 时间范围（假设 user.createdAt）
        if (dto.fromDate)
            query.andWhere('order.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('order.createdAt <= :toDate', {
                toDate: dto.toDate
            });

        const sortFieldMap = {
            actions: 'order.id',
            'parent.name': 'parent.name',
            'user.email': 'user.email',
            'user.mode': 'user.mode'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `order.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const orders = {
            overview: await this.getOverviewData(admin),
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        await this.adminService.updateLastLogin(admin.id);

        return orders;
    }

    async getOrderById(id: number): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['items', 'items.product', 'user']
        });
        if (!order) throw new NotFoundException(`Order ID ${id} not found!`);

        return order;
    }

    private STATUS_OPTIONS = [
        {
            label: '进行中',
            value: 'pending'
        },
        {
            label: '备货中',
            value: 'processing'
        },
        {
            label: '已发货',
            value: 'shipped'
        },
        {
            label: '已送达',
            value: 'delivered'
        },
        {
            label: '已取消',
            value: 'cancelled'
        },
        {
            label: '已退款',
            value: 'refunded'
        }
    ];

    private PAYMENTSTATUS_OPTIONS = [
        {
            label: '待付款',
            value: 'pending'
        },
        {
            label: '已付款',
            value: 'paid'
        },
        {
            label: '已取消',
            value: 'cancelled'
        },
        {
            label: '已退款',
            value: 'refunded'
        }
    ];

    private PAYMETHOD_OPTIONS = [
        {
            label: 'Stripe支付',
            value: 'stripe'
        },
        {
            label: '贝宝支付',
            value: 'paypal'
        },
        {
            label: '余额支付',
            value: 'balance'
        },
        {
            label: '混合支付',
            value: 'hybrid'
        },
        {
            label: '银行卡支付',
            value: 'card'
        },
        {
            label: 'Pay2s支付',
            value: 'pay2s'
        },
        {
            label: 'Lemon支付',
            value: 'lemon'
        },
        {
            label: '代付款',
            value: 'behalf'
        },
        {
            label: 'Star支付',
            value: 'starpay'
        },
        {
            label: '亲友付',
            value: 'faf'
        },
        {
            label: 'Wise支付',
            value: 'wise'
        }
    ];

    private DELIVERYMETHOD_OPTIONS = [
        {
            label: '标准配送',
            value: 'standard'
        },
        {
            label: '快速配送',
            value: 'express'
        }
    ];

    async updateOrder(
        dto: UpdateOrderStatusDto,
        adminId: number | undefined,
        req: Request
    ) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        const admin = await this.adminRepo.findOneBy({ id: adminId });

        try {
            let order = await this.orderRepo.findOne({
                where: { id: dto.id },
                relations: ['user']
            });
            if (!order) {
                throw new NotFoundException(`Order ID ${dto.id} not found!`);
            }

            const user = await this.userRepo.findOne({
                where: { id: order.user.id }
            });
            if (!user) {
                throw new NotFoundException(
                    `User ID ${order.user.id} not found!`
                );
            }
            const preBalance = user.balance;

            // 订单退款
            if (
                dto.status === OrderStatus.REFUNDED &&
                dto.paymentStatus === PaymentStatus.REFUNDED &&
                order.paymentStatus === PaymentStatus.PAID &&
                [
                    OrderStatus.PENDING,
                    OrderStatus.PROCESSING,
                    OrderStatus.SHIPPED
                ].includes(order.status)
            ) {
                // 退款逻辑
                user.balance = (
                    parseFloat(user.balance) + parseFloat(order.payAmount)
                ).toFixed(2);

                await this.userRepo.save(user);

                // 更新订单时间戳
                order.refundedAt = new Date();

                // 记录退款账单
                const inTransaction = await this.transactionRepo.findOne({
                    where: {
                        user: { id: order.user.id },
                        order: { id: order.id },
                        direction: TransactionDirection.OUT,
                        status: TransactionStatus.COMPLETED
                    }
                });
                if (inTransaction) {
                    const transaction = this.transactionRepo.create({
                        user: { id: order.user.id },
                        order: { id: order.id },
                        transactionNumber: inTransaction.transactionNumber,
                        amount: inTransaction.amount,
                        direction: TransactionDirection.IN,
                        type: inTransaction.type,
                        status: TransactionStatus.REFUNDED,
                        postBalance: user.balance
                    });

                    await queryRunner.manager.save(transaction);
                }

                if (admin) {
                    await this.logService.logAdminAction(req, {
                        adminId: admin.id,
                        userType: UserType.ADMIN,
                        action: '拒绝订单',
                        targetType: '订单',
                        targetId: order.id,
                        description: `[${admin.name}] 拒绝了该客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的订单价格 ${order.payAmount}：余额变化 '${preBalance}' -> '${user.balance}'`
                    });
                }
            }

            // 订单取消
            if (
                dto.status === OrderStatus.CANCELLED &&
                dto.paymentStatus === PaymentStatus.CANCELLED &&
                order.status === OrderStatus.PENDING &&
                order.paymentStatus === PaymentStatus.PENDING
            ) {
                // 更新订单时间戳
                order.cancelledAt = new Date();

                // 更新取消账单
                const inTransaction = await this.transactionRepo.findOne({
                    where: {
                        user: { id: order.user.id },
                        order: { id: order.id },
                        direction: TransactionDirection.OUT,
                        status: TransactionStatus.PENDING
                    }
                });
                if (inTransaction) {
                    inTransaction.status = TransactionStatus.CANCELLED;

                    await queryRunner.manager.save(inTransaction);
                }
            }

            // 创建账单
            if (
                dto.status === OrderStatus.PENDING &&
                dto.paymentStatus === PaymentStatus.PENDING &&
                order.status === OrderStatus.PENDING &&
                order.paymentStatus === PaymentStatus.PENDING
            ) {
                // 记录支付交易（避免重复）
                const inTransaction = await this.transactionRepo.findOne({
                    where: {
                        user: { id: order.user.id },
                        order: { id: order.id },
                        direction: TransactionDirection.OUT,
                        status: TransactionStatus.PENDING
                    }
                });
                if (inTransaction) {
                    inTransaction.transactionNumber =
                        dto.transactionNumber ?? '';

                    await queryRunner.manager.save(inTransaction);
                }
            }

            // 下订单
            if (
                order.status === OrderStatus.PENDING &&
                order.paymentStatus === PaymentStatus.PENDING &&
                dto.status === OrderStatus.PENDING &&
                dto.paymentStatus === PaymentStatus.PAID
            ) {
                if (admin) {
                    await this.logService.logAdminAction(req, {
                        adminId: admin.id,
                        userType: UserType.ADMIN,
                        action: '手动下单',
                        targetType: '订单',
                        targetId: order.id,
                        description: `[${admin.name}] 手动下单了该客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的订单。`
                    });

                    await this.adminEventService.addPoint(
                        admin.id,
                        user.id,
                        order.payAmount
                    );
                }

                await this.orderService.updateOrderStatus(req, dto);
                return;
            }

            // 更新订单状态
            if (order.status !== undefined && order.status !== dto.status) {
                if (admin) {
                    await this.logService.logAdminAction(req, {
                        adminId: admin.id,
                        userType: UserType.ADMIN,
                        action: '更新状态',
                        targetType: '订单',
                        targetId: order.id,
                        description: `[${admin.name}] 更新了该客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的订单：订单状态 '${this.STATUS_OPTIONS.find((opt) => opt.value === order?.status)?.label}' -> '${this.STATUS_OPTIONS.find((opt) => opt.value === dto.status)?.label}'${dto.status === OrderStatus.REFUNDED ? ' , 客户余额' + " '" + preBalance + "' -> '" + user.balance + "'" : ''}`
                    });
                }

                order.status = dto.status;
            }

            if (
                dto.paymentStatus !== undefined &&
                order.paymentStatus !== dto.paymentStatus
            ) {
                if (admin) {
                    await this.logService.logAdminAction(req, {
                        adminId: admin.id,
                        userType: UserType.ADMIN,
                        action: '更新支付状态',
                        targetType: '订单',
                        targetId: order.id,
                        description: `[${admin.name}] 更新了该客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的订单：支付状态 '${this.PAYMENTSTATUS_OPTIONS.find((opt) => opt.value === order?.paymentStatus)?.label}' -> '${this.PAYMENTSTATUS_OPTIONS.find((opt) => opt.value === dto.paymentStatus)?.label}'`
                    });
                }

                order.paymentStatus = dto.paymentStatus;
            }

            if (
                dto.paymentLink !== undefined &&
                order.paymentLink !== dto.paymentLink
            ) {
                if (admin) {
                    await this.logService.logAdminAction(req, {
                        adminId: admin.id,
                        userType: UserType.ADMIN,
                        action: '更新支付链接',
                        targetType: '订单',
                        targetId: order.id,
                        description: `[${admin.name}] 更新了该客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的订单：支付链接 '${order.paymentLink || '-'}' -> '${dto.paymentLink}'`
                    });

                    await this.notiService.sendNotification({
                        title: 'Order Payment Link',
                        userId: order.user.id,
                        content: `The payment link for the order [#${order.id}] has been automatically created`,
                        type: NotificationType.ORDER,
                        path: '/orders',
                        createdAt: new Date(),
                        targetId: order.id,
                        userType: UserType.USER,
                        enableNoti: 0,
                        extra: JSON.stringify({
                            url: dto.paymentLink
                        })
                    });
                }

                order.paymentLink = dto.paymentLink;
            }

            if (
                dto.payMethod !== undefined &&
                order.payMethod !== dto.payMethod
            ) {
                if (admin) {
                    await this.logService.logAdminAction(req, {
                        adminId: admin.id,
                        userType: UserType.ADMIN,
                        action: '更新支付方式',
                        targetType: '订单',
                        targetId: order.id,
                        description: `[${admin.name}] 更新了该客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的订单：支付方式 '${this.PAYMETHOD_OPTIONS.find((opt) => opt.value === order?.payMethod)?.label}' -> '${this.PAYMETHOD_OPTIONS.find((opt) => opt.value === dto.payMethod)?.label}'`
                    });
                }

                order.payMethod = dto.payMethod;
            }

            // 判断是否更改配送方式
            if (
                dto.deliveryMethod !== undefined &&
                order.deliveryMethod !== dto.deliveryMethod
            ) {
                if (admin) {
                    await this.logService.logAdminAction(req, {
                        adminId: admin.id,
                        userType: UserType.ADMIN,
                        action: '更新配送方式',
                        targetType: '订单',
                        targetId: order.id,
                        description: `[${admin.name}] 更新了该客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的订单：配送方式 '${this.DELIVERYMETHOD_OPTIONS.find((opt) => opt.value === order?.deliveryMethod)?.label}' -> '${this.DELIVERYMETHOD_OPTIONS.find((opt) => opt.value === dto.deliveryMethod)?.label}'`
                    });
                }

                order.deliveryMethod = dto.deliveryMethod;

                if (order.paymentStatus === PaymentStatus.PAID) {
                    order.deliveryMethodChanged = true;
                    order = await this.orderService.scheduleOrderStatus(
                        new Date(),
                        order,
                        req
                    );
                }
            }

            if (
                dto.deliveryProofImages !== undefined &&
                dto.deliveryProofImages !== order.deliveryProofImages
            ) {
                if (admin) {
                    await this.logService.logAdminAction(req, {
                        adminId: admin.id,
                        userType: UserType.ADMIN,
                        action: '更新收货图片',
                        targetType: '订单',
                        targetId: order.id,
                        description: `[${admin.name}] 更新了该客户[${user.name}/${user.mode === UserMode.LIVE ? '正式' : '试玩'}]的订单：收货图片 '${order.deliveryProofImages}' -> '${dto.deliveryProofImages}'`
                    });
                }

                order.deliveryProofImages = dto.deliveryProofImages;
            }

            if (admin) {
                await this.adminService.updateLastLogin(admin.id);
                await this.notiService.sendNotification({
                    title: '更新订单',
                    content: `${admin.name} 更新了 订单 #${order.id}`,
                    type: NotificationType.ORDER,
                    path: '/orders',
                    createdAt: new Date(),
                    userId: admin.id,
                    targetId: order.id,
                    userType: UserType.ADMIN,
                    enableNoti: 0
                });
            }

            // 保存订单状态
            await queryRunner.manager.save(order);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async getDeletedOverviewData(admin: Admin) {
        // 总订单数
        let totalDeletedOrders = 0;
        let totalQuery = this.orderRepo
            .createQueryBuilder('order')
            .withDeleted()
            .innerJoin('order.user', 'user')
            .where('order.deletedAt IS NOT NULL');

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                totalQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                totalQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                totalQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                totalQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                totalQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                totalQuery.andWhere('1 = 0');
            }
        }

        totalDeletedOrders = await totalQuery.getCount();

        // 本月删除订单数
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        let monthlyDeletedOrders = 0;
        let monthlyQuery = this.orderRepo
            .createQueryBuilder('order')
            .withDeleted()
            .innerJoin('order.user', 'user')
            .where('order.deletedAt IS NOT NULL')
            .andWhere('order.deletedAt >= :start', { start: startOfMonth })
            .andWhere('order.deletedAt < :end', { end: endOfMonth });

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                monthlyQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                monthlyQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                monthlyQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                monthlyQuery.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                monthlyQuery.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                monthlyQuery.andWhere('1 = 0');
            }
        }

        monthlyDeletedOrders = await monthlyQuery.getCount();

        const overview = {
            totalDeletedOrders,
            monthlyDeletedOrders
        };

        return overview;
    }

    async getDeleted(adminId: number, dto: SearchOrderDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const skip = (dto.page - 1) * dto.limit;
        const query = this.orderRepo
            .createQueryBuilder('order')
            .withDeleted()
            .leftJoin('order.items', 'items')
            .leftJoin('order.user', 'user')
            .leftJoin('user.parent', 'parent')
            .leftJoin('user.role', 'role')
            .select([
                'order.id',
                'order.imageUrl',
                'order.subtotal',
                'order.quantity',
                'order.vat',
                'order.deliveryFee',
                'order.totalPrice',
                'order.discountPayPal',
                'order.balanceDeduct',
                'order.payAmount',
                'order.payMethod',
                'order.hybridMethod',
                'order.status',
                'order.paymentStatus',
                'order.userName',
                'order.userMobile',
                'order.userAddress',
                'order.paymentLink',
                'order.shareLink',
                'order.deliveryMethod',
                'order.createdAt',
                'order.paidAt',
                'order.processingAt',
                'order.shippedAt',
                'order.deliveredAt',
                'order.cancelledAt',
                'order.refundedAt',
                'order.estimatedProcessingAt',
                'order.estimatedShippedAt',
                'order.estimatedDeliveredAt',
                'order.deletedAt',
                'items.id',
                'items.productImage',
                'items.productName',
                'items.quantity',
                'items.unitPrice',
                'items.totalPrice',
                'user.id',
                'user.name',
                'user.phone',
                'user.email',
                'user.city',
                'user.state',
                'user.country',
                'user.mode',
                'parent.id',
                'parent.name'
            ]);

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

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
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0'); // 没有匹配的用户，不返回订单
            }
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0'); // 没有匹配的用户，不返回订单
            }
        }

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0'); // 没有匹配的用户，不返回订单
            }
        }

        if (dto.orderId)
            query.andWhere('order.id = :orderId', { orderId: dto.orderId });
        if (dto.email)
            query.andWhere('user.email LIKE :email', {
                email: `%${dto.email}%`
            });
        if (dto.parentId !== undefined)
            query.andWhere('parent.id = :parentId', { parentId: dto.parentId });
        if (dto.mode !== undefined)
            query.andWhere('user.mode = :mode', { mode: dto.mode });
        if (dto.deliveryMethod !== undefined)
            query.andWhere('order.deliveryMethod = :deliveryMethod', {
                deliveryMethod: dto.deliveryMethod
            });
        if (dto.payMethod !== undefined)
            query.andWhere('order.payMethod = :payMethod', {
                payMethod: dto.payMethod
            });
        if (dto.hybridMethod !== undefined)
            query.andWhere('order.hybridMethod = :hybridMethod', {
                hybridMethod: dto.hybridMethod
            });
        if (dto.status !== undefined)
            query.andWhere('order.status = :status', { status: dto.status });
        if (dto.paymentStatus !== undefined)
            query.andWhere('order.paymentStatus = :paymentStatus', {
                paymentStatus: dto.paymentStatus
            });
        // 金额区间（假设 user.balance 字段为 number）
        if (dto.balanceGreaterThan)
            query.andWhere('order.payAmount >= :balanceGreaterThan', {
                balanceGreaterThan: parseFloat(dto.balanceGreaterThan)
            });
        if (dto.balanceLessThan)
            query.andWhere('order.payAmount <= :balanceLessThan', {
                balanceLessThan: parseFloat(dto.balanceLessThan)
            });
        // 时间范围（假设 user.deletedAt
        if (dto.fromDate)
            query.andWhere('order.deletedAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('order.deletedAt <= :toDate', {
                toDate: dto.toDate
            });

        query.andWhere('order.deletedAt IS NOT NULL');

        const sortFieldMap = {
            actions: 'order.id',
            'parent.name': 'parent.name',
            'user.email': 'user.email',
            'user.mode': 'user.mode'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `order.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const orders = {
            overview: await this.getDeletedOverviewData(admin),
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        await this.adminService.updateLastLogin(admin.id);

        return orders;
    }

    async delete(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const order = await this.orderRepo.findOne({
                where: { id },
                relations: ['user']
            });
            if (!order)
                throw new NotFoundException(`Product ID ${id} not found!`);

            await this.orderRepo.softDelete(id);
            await this.adminService.updateLastLogin(admin.id);
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '软删除订单',
                targetType: '订单',
                targetId: id,
                description: `[${admin.name}] 删除了该客户[${order.user.name}/${order.user.mode === UserMode.LIVE ? '正式' : '试玩'}]的订单：数量'${order.quantity}', 总价'${order.totalPrice}'`
            });
            await this.notiService.sendNotification({
                title: '删除订单',
                content: `${admin.name} 删除了 订单 #${order.id}`,
                type: NotificationType.ORDER,
                path: '/orders',
                createdAt: new Date(),
                userId: admin.id,
                targetId: order.id,
                userType: UserType.ADMIN,
                enableNoti: 0
            });
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async create(dto: AdminCreateOrderDto, adminId: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const user = await this.userRepo.findOne({
                where: { id: dto.userId }
            });
            if (!user)
                throw new NotFoundException(`User ID ${dto.userId} not found`);

            const uuid = uuidv4();

            let order = queryRunner.manager.create(Order, {
                ...dto,
                user,
                subtotal: String(
                    (
                        parseInt(dto.quantity, 10) * parseFloat(dto.payAmount)
                    ).toFixed(2)
                ),
                totalPrice: String(
                    (
                        parseInt(dto.quantity, 10) * parseFloat(dto.payAmount)
                    ).toFixed(2)
                ),
                payAmount: String(
                    (
                        parseInt(dto.quantity, 10) * parseFloat(dto.payAmount)
                    ).toFixed(2)
                ),
                quantity: parseInt(dto.quantity, 10),
                status: OrderStatus.PENDING,
                paymentType: PaymentStatus.PENDING,
                hybridMethod: dto.payMethod,
                uuid,
                shareLink: `${process.env.HOST_BASE_URL}/pay/${uuid}`
            });
            order = await queryRunner.manager.save(order);

            const orderItem = queryRunner.manager.create(OrderItem, {
                user,
                order,
                productName: dto.productName,
                productImage: dto.imageUrl,
                quantity: parseInt(dto.quantity, 10),
                unitPrice: dto.payAmount,
                totalPrice: String(
                    (
                        parseFloat(dto.quantity) * parseFloat(dto.payAmount)
                    ).toFixed(2)
                )
            });
            await queryRunner.manager.save(orderItem);

            // 记录支付交易账单（避免重复）
            const existTransaction = await this.transactionRepo.findOne({
                where: {
                    user: { id: order.user.id },
                    order: { id: order.id },
                    direction: TransactionDirection.OUT
                }
            });
            if (!existTransaction) {
                const transaction = this.transactionRepo.create({
                    user: { id: order.user.id },
                    order: { id: order.id },
                    amount: order.payAmount,
                    direction: TransactionDirection.OUT,
                    method: order.payMethod,
                    hybridMethod: order.hybridMethod,
                    type: TransactionType.ORDER_PAYMENT,
                    status: TransactionStatus.PENDING,
                    postBalance: user.balance
                });

                await queryRunner.manager.save(transaction);
            }

            // 读取系统设置，决定是否自动取消未支付订单
            const setting = await this.settingRepo.findOneBy({
                key: 'delivery',
                group: 'setting'
            });

            // 读取配送时间设置
            const raw = JSON.parse(setting?.value || '{}');
            const deliSetting = JSON.parse(raw.deliveryRules || '[]');
            const deliMethod = deliSetting.find(
                (item: any) => item.code === order.deliveryMethod
            );

            // 未付款的情况下，订单将在24小时之后自动取消
            await this.jobsQueue.scheduleOrderStatus(
                order.id,
                new Date(
                    Date.now() +
                        (deliMethod?.autoCancelUnpaidHours || 24) *
                            60 *
                            60 *
                            1000
                ),
                OrderStatus.CANCELLED,
                PaymentStatus.CANCELLED,
                req
            );

            await this.adminService.updateLastLogin(admin.id);
            await this.notiService.sendNotification({
                title: 'New Order/新订单',
                content: `管理员[ID: ${admin.id}/${admin.name}]创建了价格为${order.payAmount}的新订单 #${order.id}`,
                type: NotificationType.ORDER,
                path: '/orders',
                createdAt: new Date(),
                userId: admin.id,
                targetId: order.id,
                userType: UserType.ADMIN,
                enableNoti: 1
            });
            await this.logService.logAdminAction(req, {
                userId: admin.id,
                userType: UserType.ADMIN,
                action: '后台下单',
                targetType: '订单',
                targetId: order.id,
                description: `管理员 [${admin.name}] 下单了价值 ${order.payAmount} 的订单。`
            });
            await queryRunner.commitTransaction();
            
            return order;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
