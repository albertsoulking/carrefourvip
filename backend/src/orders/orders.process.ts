import {
    OnQueueCompleted,
    OnQueueFailed,
    Process,
    Processor
} from '@nestjs/bull';
import { Job } from 'bull';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Processor('order')
export class OrderProcessor {
    constructor(private readonly orderService: OrdersService) {}

    @Process('update-status')
    async handleStatusUpdate(job: Job) {
        const { orderId, nextStatus, nextPaymentStatus, req } = job.data;
        console.log(`[OrderQueue] Updating Order ${orderId} to ${nextStatus}`);

        const dto = new UpdateOrderStatusDto();
        dto.id = orderId;
        dto.status = nextStatus;
        dto.paymentStatus = nextPaymentStatus;
        
        try {
            await this.orderService.updateOrderStatus(req, dto);
        } catch (error) {
            throw error;
        }
    }

    @OnQueueFailed()
    onFailed(job: Job, error: any) {
        console.error(`❌ 队列任务失败: ID=${job.id}, 错误=`, error);
    }

    @OnQueueCompleted()
    onCompleted(job: Job) {
        console.log(`✅ 队列任务完成: ID=${job.id}`);
    }
}
