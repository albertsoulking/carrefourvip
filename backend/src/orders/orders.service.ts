import {
    Injectable,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Cart } from 'src/cart/entity/cart.entity';
import { JobsQueue } from 'src/jobs/jobs.queue';
import { Setting } from 'src/settings/entity/setting.entity';
import {
    TransactionDirection,
    TransactionMethod,
    TransactionStatus,
    TransactionType
} from 'src/transactions/enum/transactions.enum';
import { UsersService } from 'src/users/users.service';
import { OrderStatus, PaymentStatus } from './enums/order.enum';
// 推荐用 uuid 库
import { v4 as uuidv4 } from 'uuid';
import { SearchOrderDto } from './dto/search-order.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';
import { LogService } from 'src/system_log/log.service';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { Request } from 'express';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepo: Repository<OrderItem>,
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
        @InjectRepository(Cart)
        private readonly cartRepo: Repository<Cart>,
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>,
        private readonly dataSource: DataSource,
        private readonly jobsQueue: JobsQueue,
        private readonly userService: UsersService,
        private readonly notiService: NotificationService,
        private readonly logService: LogService
    ) {}

    getPaymentLink(amount: string) {
        const microLink = 'https://paypal.me/CarrefourvipLLC01';
        const shareLink1 = 'https://paypal.me/carrefourvipLLC';
        const shareLink2 = 'https://paypal.me/Shreya6868';
        const bigLink = 'https://paypal.me/PhuongPham259';

        const payAmount = Number(amount);
        let chosenLink: string;

        if (payAmount < 30) {
            chosenLink = microLink;
        } else if (payAmount <= 100) {
            // const mediumLinks = [shareLink2];
            // const randomIndex = Math.floor(Math.random() * mediumLinks.length);
            // chosenLink = mediumLinks[randomIndex];
            chosenLink = shareLink2;
        } else if (payAmount <= 500) {
            chosenLink = shareLink1;
        } else if (payAmount <= 999) {
            chosenLink = bigLink;
        } else {
            chosenLink = '';
        }

        return chosenLink ? `${chosenLink}/${amount}eur` : '';
    }

    async createOrder(
        userId: number,
        dto: CreateOrderDto,
        req: Request
    ): Promise<Order> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await this.usersRepo.findOne({
                where: { id: userId }
            });
            if (!user) throw new NotFoundException('User not found');

            const cartItems = await this.cartRepo
                .createQueryBuilder('cart')
                .leftJoinAndSelect('cart.product', 'product')
                .leftJoinAndSelect('cart.user', 'user')
                .leftJoinAndSelect('product.category', 'category')
                .where('user.id = :userId', { userId })
                .getMany();

            if (!cartItems.length) {
                throw new BadRequestException('Cart is empty');
            }

            const uuid = uuidv4();

            // 创建 订单
            let order = queryRunner.manager.create(Order, {
                ...dto,
                user,
                status: OrderStatus.PENDING,
                paymentType: PaymentStatus.PENDING,
                uuid,
                shareLink: `${process.env.HOST_BASE_URL}/pay/${uuid}`
            });

            if (dto.payMethod === TransactionMethod.BEHALF) {
                order.paymentLink = `${process.env.HOST_BASE_URL}/pay/${uuid}`;
            }

            if (dto.payMethod === TransactionMethod.FAF) {
                order.paymentLink = this.getPaymentLink(dto.payAmount);
            }

            order = await queryRunner.manager.save(order);

            // 创建 order items
            const orderItems = cartItems
                .filter((item) => dto.selectedItems.includes(item.id))
                .map((item) => {
                    return this.orderItemRepo.create({
                        ...item,
                        user,
                        order,
                        product: item.product,
                        productName: item.product.name,
                        productImage: item.imageUrl,
                        productDesc: item.product.description,
                        categoryName: item.product.category.name
                    });
                });
            await queryRunner.manager.save(orderItems);

            // 删除用户购物车中的商品
            if (dto.selectedItems?.length) {
                await queryRunner.manager.delete(Cart, {
                    id: In(dto.selectedItems)
                });
            }

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
                    amount: order.totalPrice,
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

            await this.userService.updateLastLogin(user.id);
            await this.notiService.sendNotification({
                title: 'New Order/新订单',
                content: `客户[ID: ${order.user.id}/${order.user.name}]创建了价格为${order.payAmount}的新订单 #${order.id}`,
                type: NotificationType.ORDER,
                path: '/orders',
                createdAt: new Date(),
                userId: user.id,
                targetId: order.id,
                userType: UserType.ADMIN,
                enableNoti: 1
            });
            await this.logService.logAdminAction(req, {
                userId: user.id,
                userType: UserType.USER,
                action: '客户下单',
                targetType: '订单',
                targetId: order.id,
                description: `客户 [${user.name}] 下单了价值 ${order.payAmount} 的订单。`
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

    async scheduleOrderStatus(now: Date, order: Order, req: Request) {
        // 获取订单配送时间
        const setting = await this.settingRepo.findOneBy({
            key: 'delivery',
            group: 'setting'
        });
        if (!setting) throw new NotFoundException('Invalid Input!');

        // 读取配送时间设置
        const raw = JSON.parse(setting.value || '{}');
        const deliSetting = JSON.parse(raw.deliveryRules || '[]');
        const deliMethod = deliSetting.find(
            (item: any) => item.code === order.deliveryMethod
        );
        if (!deliMethod) return order;

        // 设定随机订单状态预计时间
        const randInt = (min: string, max: string) =>
            Math.random() * (parseFloat(max) - parseFloat(min)) +
            parseFloat(min);

        // pending(paid) -> processing
        const processingIn = randInt(
            deliMethod.processingDelayMin,
            deliMethod.processingDelayMax
        );

        // processing -> shipped
        const shippedIn = randInt(
            deliMethod.shippedDelayMin,
            deliMethod.shippedDelayMax
        );
        // shipped -> delivered
        const deliveredIn = randInt(
            deliMethod.deliveredDelayMin,
            deliMethod.deliveredDelayMax
        );

        // 设置时间
        const addEstimated = (date: Date, hours: number) => {
            return new Date(date.getTime() + hours * 60 * 60 * 1000);
        };

        // estimate: paid -> processing
        if (!order.processingAt)
            order.estimatedProcessingAt = addEstimated(now, processingIn);

        // estimate: processing -> shipped
        if (!order.shippedAt)
            order.estimatedShippedAt = addEstimated(
                order.estimatedProcessingAt,
                shippedIn
            );

        // estimate: shipped -> delivered
        if (!order.deliveredAt)
            order.estimatedDeliveredAt = addEstimated(
                order.estimatedShippedAt,
                deliveredIn
            );

        if (order.deliveryMethodChanged) {
            order.deliveryMethodChanged = false;

            // 重新添加队列
            const isTerminalStatus = [
                OrderStatus.CANCELLED,
                OrderStatus.DELIVERED,
                OrderStatus.REFUNDED
            ].includes(order.status);

            // 调度延迟任务，负责后续状态自动推进
            if (!isTerminalStatus) {
                // 处理 processing
                if (!order.processingAt && order.estimatedProcessingAt > now) {
                    await this.jobsQueue.rescheduleOrderStatusJob(
                        order.id,
                        order.estimatedProcessingAt,
                        OrderStatus.PROCESSING,
                        PaymentStatus.PAID,
                        req
                    );
                }

                // 处理 shipped
                if (!order.shippedAt && order.estimatedShippedAt > now) {
                    await this.jobsQueue.rescheduleOrderStatusJob(
                        order.id,
                        order.estimatedShippedAt,
                        OrderStatus.SHIPPED,
                        PaymentStatus.PAID,
                        req
                    );
                }

                // 处理 delivered
                if (!order.deliveredAt && order.estimatedDeliveredAt > now) {
                    await this.jobsQueue.rescheduleOrderStatusJob(
                        order.id,
                        order.estimatedDeliveredAt,
                        OrderStatus.DELIVERED,
                        PaymentStatus.PAID,
                        req
                    );
                }
            }
        } else {
            // 添加队列
            // 调度延迟任务，负责后续状态自动推进
            if (!order.processingAt) {
                await this.jobsQueue.scheduleOrderStatus(
                    order.id,
                    order.estimatedProcessingAt,
                    OrderStatus.PROCESSING,
                    PaymentStatus.PAID,
                    req
                );
            }

            if (!order.shippedAt) {
                await this.jobsQueue.scheduleOrderStatus(
                    order.id,
                    order.estimatedShippedAt,
                    OrderStatus.SHIPPED,
                    PaymentStatus.PAID,
                    req
                );
            }

            if (!order.deliveredAt) {
                await this.jobsQueue.scheduleOrderStatus(
                    order.id,
                    order.estimatedDeliveredAt,
                    OrderStatus.DELIVERED,
                    PaymentStatus.PAID,
                    req
                );
            }
        }

        // 保存更新到数据库
        await this.orderRepo.save(order);

        return order;
    }

    async updateOrderStatus(
        req: Request,
        dto: UpdateOrderStatusDto
    ): Promise<{ status: OrderStatus; paymentStatus: PaymentStatus }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let order = await this.orderRepo.findOne({
                where: { id: dto.id },
                relations: ['user']
            });
            if (!order) {
                throw new NotFoundException('Order not found');
            }

            const user = await this.usersRepo.findOne({
                where: { id: order.user.id }
            });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const now = new Date();

            // --- 状态分支处理 ---
            // --- 支付成功（仅更新支付状态，保持订单状态pending） ---
            // order: pending -> pending
            // payment: pending -> paid

            if (
                order.status === OrderStatus.PENDING &&
                order.paymentStatus === PaymentStatus.PENDING &&
                dto.status === OrderStatus.PENDING &&
                dto.paymentStatus === PaymentStatus.PAID
            ) {
                // 更新支付状态为已支付
                order.paymentStatus = PaymentStatus.PAID;
                if (!order.paidAt) order.paidAt = now;

                // 添加自动执行队列
                order = await this.scheduleOrderStatus(now, order, req);

                // 更新客户余额
                const balance = parseFloat(user.balance || '0');
                const deduct = parseFloat(order.balanceDeduct || '0');

                const newBalance = balance - deduct;

                if (isNaN(newBalance) || newBalance < 0) {
                    throw new BadRequestException('Insufficient balance!');
                }

                user.balance = newBalance.toFixed(2);

                await queryRunner.manager.save(user);

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
                    inTransaction.postBalance = user.balance;
                    inTransaction.status = TransactionStatus.COMPLETED;
                    inTransaction.transactionNumber =
                        dto.transactionNumber ??
                        inTransaction.transactionNumber;

                    await queryRunner.manager.save(inTransaction);
                }

                await this.userService.updateLastLogin(user.id);
                await this.notiService.sendNotification({
                    title: 'Pay the order/已支付订单',
                    content: `客户[ID: ${order.user.id}/${order.user.name}]支付了价格为 ${order.payAmount} 的订单 #${order.id}`,
                    type: NotificationType.ORDER,
                    path: '/orders',
                    createdAt: new Date(),
                    userId: user.id,
                    targetId: order.id,
                    userType: UserType.ADMIN,
                    enableNoti: 1
                });
                await this.logService.logAdminAction(req, {
                    userId: user.id,
                    userType: UserType.USER,
                    action: '支付订单',
                    targetType: '订单',
                    targetId: order.id,
                    description: `客户 [${user.name}] 支付了价值 ${order.payAmount} 的订单。`
                });
            }

            // 支付失败
            // order: pending -> cacelled
            // payment: pending -> cancelled
            if (
                order.status === OrderStatus.PENDING &&
                order.paymentStatus === PaymentStatus.PENDING &&
                dto.status === OrderStatus.CANCELLED &&
                dto.paymentStatus === PaymentStatus.CANCELLED
            ) {
                order.status = OrderStatus.CANCELLED;
                order.paymentStatus = PaymentStatus.CANCELLED;
                order.cancelledAt ??= now;

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

                await this.userService.updateLastLogin(user.id);
                await this.notiService.sendNotification({
                    title: 'Cancel Order/取消订单',
                    content: `客户[ID: ${order.user.id}/${order.user.name}]取消了价格为 ${order.payAmount} 的订单 #${order.id}`,
                    type: NotificationType.ORDER,
                    path: '/orders',
                    createdAt: new Date(),
                    userId: user.id,
                    targetId: order.id,
                    userType: UserType.ADMIN,
                    enableNoti: 1
                });
                await this.logService.logAdminAction(req, {
                    userId: user.id,
                    userType: UserType.USER,
                    action: '取消订单',
                    targetType: '订单',
                    targetId: order.id,
                    description: `客户 [${user.name}] 取消了价值 ${order.payAmount} 的订单。`
                });
            }

            // 备货中
            // order: pending -> processing
            // payment: paid
            if (
                order.status === OrderStatus.PENDING &&
                order.paymentStatus === PaymentStatus.PAID &&
                dto.status === OrderStatus.PROCESSING &&
                dto.paymentStatus === PaymentStatus.PAID
            ) {
                order.processingAt ??= now;
                await this.notiService.sendNotification({
                    title: '更新订单',
                    content: `订单#${order.id}状态已更新为 备货中`,
                    type: NotificationType.ORDER,
                    path: '/orders',
                    createdAt: new Date(),
                    userId: user.id,
                    targetId: order.id,
                    userType: UserType.ADMIN,
                    enableNoti: 0
                });
            }

            // 送货中
            // order: processing -> shipped
            // payment: paid
            if (
                order.status === OrderStatus.PROCESSING &&
                order.paymentStatus === PaymentStatus.PAID &&
                dto.status === OrderStatus.SHIPPED &&
                dto.paymentStatus === PaymentStatus.PAID
            ) {
                order.shippedAt ??= now;
                await this.notiService.sendNotification({
                    title: '更新订单',
                    content: `订单#${order.id}状态已更新为 发货中`,
                    type: NotificationType.ORDER,
                    path: '/orders',
                    createdAt: new Date(),
                    userId: user.id,
                    targetId: order.id,
                    userType: UserType.ADMIN,
                    enableNoti: 0
                });
            }

            // 已送达
            // order: shipped -> delivered
            // payment: paid
            if (
                order.status === OrderStatus.SHIPPED &&
                order.paymentStatus === PaymentStatus.PAID &&
                dto.status === OrderStatus.DELIVERED &&
                dto.paymentStatus === PaymentStatus.PAID
            ) {
                order.deliveredAt ??= now;
                await this.notiService.sendNotification({
                    title: '更新订单',
                    content: `订单#${order.id}状态已更新为 已送达`,
                    type: NotificationType.ORDER,
                    path: '/orders',
                    createdAt: new Date(),
                    userId: user.id,
                    targetId: order.id,
                    userType: UserType.ADMIN,
                    enableNoti: 0
                });
            }

            // 已退款
            // order: [processing, shipped]-> refunded
            // payment: paid -> refunded
            if (
                (order.status === OrderStatus.PROCESSING ||
                    order.status === OrderStatus.SHIPPED) &&
                order.paymentStatus === PaymentStatus.PAID &&
                dto.status === OrderStatus.CANCELLED &&
                dto.paymentStatus === PaymentStatus.REFUNDED
            ) {
                order.status = OrderStatus.REFUNDED;
                order.paymentStatus = PaymentStatus.REFUNDED;
                order.refundedAt ??= now;

                await this.userService.updateLastLogin(user.id);
                await this.notiService.sendNotification({
                    title: '更新订单',
                    content: `订单#${order.id}状态已更新为 已退款`,
                    type: NotificationType.ORDER,
                    path: '/orders',
                    createdAt: new Date(),
                    userId: user.id,
                    targetId: order.id,
                    userType: UserType.ADMIN,
                    enableNoti: 0
                });
            }

            // 安全地更新订单状态（防止“已完成”订单被误取消）
            const terminalStatuses = [
                OrderStatus.CANCELLED,
                OrderStatus.REFUNDED,
                OrderStatus.DELIVERED
            ];
            if (
                !terminalStatuses.includes(order.status) && // 当前不是终态
                dto.status !== order.status
            ) {
                order.status = dto.status;
            }

            order.paypalResponseRaw =
                dto.paypalResponseRaw ?? order.paypalResponseRaw;

            await queryRunner.manager.save(order);
            await queryRunner.commitTransaction();

            return { status: order.status, paymentStatus: order.paymentStatus };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getOrderById(orderId: number, userId: number): Promise<Order | null> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId, user: { id: userId } },
            relations: ['items', 'user'],
            select: {
                id: true,
                status: true,
                paymentStatus: true,
                paymentLink: true,
                shareLink: true,
                userName: true,
                userAddress: true,
                userMobile: true,
                items: {
                    id: true,
                    productName: true,
                    productImage: true,
                    categoryName: true,
                    unitPrice: true,
                    quantity: true,
                    totalPrice: true
                },
                subtotal: true,
                deliveryFee: true,
                totalPrice: true,
                payAmount: true,
                discountPayPal: true,
                balanceDeduct: true,
                vat: true,
                createdAt: true,
                user: {
                    id: true,
                    name: true
                },
                paidAt: true,
                processingAt: true,
                shippedAt: true,
                deliveredAt: true,
                cancelledAt: true,
                refundedAt: true,
                deliveryProofImages: true,
                payMethod: true,
                hybridMethod: true,
                deliveryMethod: true
            }
        });

        return order;
    }

    async findMyOrders(
        userId: number,
        dto: SearchOrderDto
    ): Promise<{
        data: Order[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const skip = (dto.page - 1) * dto.limit;

        const query = this.orderRepo
            .createQueryBuilder('order')
            .where('order.userId = :userId', { userId })
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product');

        if (dto.status !== undefined)
            query.andWhere('order.status = :status', { status: dto.status });

        await this.userService.updateLastLogin(userId);

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';
        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(`order.${dto.sortBy}`, direction)
            .getManyAndCount();

        const orders = {
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return orders;
    }

    async deleteOrder(orderId: number, req: Request) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['user']
        });
        if (!order) throw new NotFoundException('Order not found');

        const user = await this.usersRepo.findOne({
            where: { id: order.user.id }
        });
        if (!user) throw new NotFoundException('User not found');

        // 软删除
        await this.orderRepo.softDelete(orderId);
        await this.userService.updateLastLogin(order.user.id);
        await this.logService.logAdminAction(req, {
            userId: user.id,
            userType: UserType.USER,
            action: '删除订单',
            targetType: '订单',
            targetId: order.id,
            description: `客户 [${user.name}] 删除了价值 ${order.payAmount} 的订单。`
        });
        await this.notiService.sendNotification({
            title: '删除订单',
            content: `客户[ID: ${order.user.id}/${order.user.name}]删除了订单 #${order.id}`,
            type: NotificationType.ORDER,
            path: '/orders',
            createdAt: new Date(),
            userId: user.id,
            targetId: order.id,
            userType: UserType.ADMIN,
            enableNoti: 0
        });
    }

    async getPayOrder(uuid: string) {
        const order = await this.orderRepo.findOne({
            where: { uuid },
            relations: ['items'],
            select: {
                id: true,
                userName: true,
                userMobile: true,
                userAddress: true,
                deliveryMethod: true,
                subtotal: true,
                deliveryFee: true,
                vat: true,
                balanceDeduct: true,
                discountPayPal: true,
                payAmount: true,
                paymentStatus: true,
                payMethod: true,
                paymentLink: true,
                items: {
                    id: true,
                    productName: true,
                    productImage: true,
                    quantity: true,
                    totalPrice: true
                }
            }
        });

        return order;
    }

    async updateOrder(orderId: number, image: string, req: Request) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['user']
        });
        if (!order)
            throw new NotFoundException(`Order ID ${orderId} not found`);

        const user = await this.usersRepo.findOne({
            where: { id: order.user.id }
        });
        if (!user) throw new NotFoundException('User not found');

        order.deliveryProofImages = image;

        await this.orderRepo.save(order);
        await this.logService.logAdminAction(req, {
            userId: user.id,
            userType: UserType.USER,
            action: '上传到货图',
            targetType: '订单',
            targetId: order.id,
            description: `客户 [${user.name}] 上传了价值 ${order.payAmount} 订单的到货图片。`
        });
    }
}
