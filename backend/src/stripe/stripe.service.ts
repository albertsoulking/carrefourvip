import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { JobsQueue } from 'src/jobs/jobs.queue';
import { UpdateOrderStatusDto } from 'src/orders/dto/update-order-status.dto';
import { OrderStatus, PaymentStatus } from 'src/orders/enums/order.enum';
import { AdminOrderService } from 'src/orders/orders.admin.service';
import { Setting } from 'src/settings/entity/setting.entity';
import { CreateTransactionDto } from 'src/transactions/dto/create-transaction.dto';
import {
    TransactionStatus,
    TransactionType
} from 'src/transactions/enum/transactions.enum';
import { AdminTransactionService } from 'src/transactions/transactions.admin.service';
import { User } from 'src/users/entities/user.entity';
import Stripe from 'stripe';
import { Repository } from 'typeorm';

@Injectable()
export class StripeService {
    constructor(
        private readonly adminOrderService: AdminOrderService,
        private readonly adminTransactionService: AdminTransactionService,
        private readonly jobsQueue: JobsQueue,
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {}

    async createCheckoutSession(
        userId: number,
        order: {
            orderId: number;
            price: number;
            name: string;
            type: TransactionType;
        },
        req: Request
    ) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User ID ${userId} not found`);
        }

        const security = await this.settingRepo.findOne({
            where: { key: `sk_live`, group: 'stripe' }
        });
        if (!security) {
            throw new NotFoundException('Invalid Payment');
        }

        const stripe = new Stripe(security.value!, {
            apiVersion: '2025-05-28.basil' // 确保使用最新 API
        });

        let successUrl = process.env.HOST_BASE_URL;
        let cancelUrl = process.env.HOST_BASE_URL;

        if (order.type === TransactionType.ORDER_PAYMENT) {
            successUrl = `${process.env.HOST_BASE_URL}/payment/${order.orderId}/success`;
            cancelUrl = `${process.env.HOST_BASE_URL}/payment/${order.orderId}/cancel`;
        }

        if (order.type === TransactionType.DEPOSIT) {
            const dto = new CreateTransactionDto();
            dto.userId = userId;
            dto.amount = (order.price / 100).toString();

            const transaction =
                await this.adminTransactionService.createTransaction(dto);

            successUrl = `${process.env.HOST_BASE_URL}/profile/my-wallet/${transaction.id}/success`;
            cancelUrl = `${process.env.HOST_BASE_URL}/profile/my-wallet/${transaction.id}/cancel`;

            await this.jobsQueue.scheduleTransactionStatus(
                transaction.id,
                TransactionStatus.CANCELLED
            );
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: { name: order.name },
                        unit_amount: order.price // 单位为 "分"
                    },
                    quantity: 1
                }
            ],
            success_url: successUrl,
            cancel_url: cancelUrl
        });

        if (order.type === TransactionType.ORDER_PAYMENT) {
            const dto = new UpdateOrderStatusDto();
            dto.id = order.orderId;
            dto.status = OrderStatus.PENDING;
            dto.paymentStatus = PaymentStatus.PENDING;
            dto.transactionNumber = session.id;
            dto.paymentLink = session.url ?? '';

            await this.adminOrderService.updateOrder(dto, undefined, req);
        }

        return { url: session.url, id: session.id };
    }
}
