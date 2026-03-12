import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Request } from 'express';
import { OrderStatus, PaymentStatus } from 'src/orders/enums/order.enum';
import { TransactionStatus } from 'src/transactions/enum/transactions.enum';

@Injectable()
export class JobsQueue {
    constructor(
        @InjectQueue('order')
        private readonly orderQueue: Queue,
        @InjectQueue('transaction')
        private readonly transactionQueue: Queue,
        @InjectQueue('auth')
        private readonly authQueue: Queue
    ) {}

    /**
     * Initialize the job queue and log the connection status.
     */
    async onModuleInit() {
        const statsOrder = await this.orderQueue.getJobCounts();
        console.log('✅ Bull connected. Order job counts:', statsOrder);

        const statsTransaction = await this.transactionQueue.getJobCounts();
        console.log(
            '✅ Bull connected. Transaction job counts:',
            statsTransaction
        );

        const statsAuth = await this.authQueue.getJobCounts();
        console.log('✅ Bull connected. Authentication job counts:', statsAuth);
    }

    /**
     * Schedule an order status update at a specific time.
     * @param orderId The ID of the order to update.
     * @param runAt The date and time when the status should be updated.
     * @param nextStatus The new status to set for the order.
     */
    async scheduleOrderStatus(
        orderId: number,
        runAt: Date,
        nextStatus: OrderStatus,
        nextPaymentStatus: PaymentStatus,
        req: Request
    ) {
        const delay = runAt.getTime() - Date.now();
        console.log(
            `⏰ 将在 ${runAt.toLocaleTimeString()} 执行订单 ${orderId} 的状态更新为 ${nextStatus}`
        );

        await this.orderQueue.add(
            'update-status',
            {
                orderId,
                nextStatus,
                nextPaymentStatus,
                req: {
                    headers: req?.headers,
                    ip: req?.ip,
                    user: (req as any)?.user
                }
            },
            {
                delay: Math.max(0, delay),
                jobId: `order-${orderId}-to-${nextStatus.toLowerCase()}`,
                attempts: 3,
                backoff: 10000,
                removeOnComplete: true
            }
        );
    }

    async rescheduleOrderStatusJob(
        orderId: number,
        newRunAt: Date,
        status: OrderStatus,
        paymentStatus: PaymentStatus,
        req: Request
    ) {
        const jobId = `order-${orderId}-to-${status.toLowerCase()}`;
        const delay = newRunAt.getTime() - Date.now();

        // 删除旧的 job（如果有）
        const oldJob = await this.orderQueue.getJob(jobId);
        if (oldJob) {
            await oldJob.remove();
        }

        // 添加新的 job
        await this.orderQueue.add(
            'update-status',
            {
                orderId,
                nextStatus: status,
                nextPaymentStatus: paymentStatus,
                req: {
                    headers: req?.headers,
                    ip: req?.ip,
                    user: (req as any)?.user
                }
            },
            {
                delay,
                jobId,
                attempts: 3,
                backoff: 10000,
                removeOnComplete: true
            }
        );
    }

    async scheduleTransactionStatus(
        transactionId: number,
        nextStatus: TransactionStatus
    ) {
        await this.transactionQueue.add(
            'update-status',
            { transactionId, nextStatus },
            {
                delay: 15 * 60 * 1000,
                attempts: 3,
                backoff: 10000,
                removeOnComplete: true
            }
        );
    }

    async scheduleAdminLogout(id: number, req: Request) {
        const delay = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const date = new Date(delay);

        await this.authQueue.add(
            'admin-logout',
            {
                id,
                req: {
                    headers: req?.headers,
                    ip: req?.ip,
                    user: (req as any)?.user
                }
            },
            {
                delay,
                jobId: `admin-${id}-logout-at-${date.toLocaleString()}`,
                attempts: 3,
                backoff: 10000,
                removeOnComplete: true
            }
        );
    }

    async scheduleUserLogout(id: number, req: Request) {
        const delay = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const date = new Date(delay);

        await this.authQueue.add(
            'user-logout',
            {
                id,
                req: {
                    headers: req?.headers,
                    ip: req?.ip,
                    user: (req as any)?.user
                }
            },
            {
                delay,
                jobId: `user-${id}-logout-at-${date.toLocaleString()}`,
                attempts: 3,
                backoff: 10000,
                removeOnComplete: true
            }
        );
    }
}
