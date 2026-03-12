import {
    OnQueueCompleted,
    OnQueueFailed,
    Process,
    Processor
} from '@nestjs/bull';
import { Job } from 'bull';
import { TransactionsService } from './transactions.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Processor('transaction')
export class TransactionProcessor {
    constructor(private readonly transactionService: TransactionsService) {}

    @Process('update-status')
    async handleStatusUpdate(job: Job) {
        const { transactionId, nextStatus } = job.data;
        console.log(`[TransactionQueue] Updating transaction ${transactionId} to ${nextStatus}`);

        const dto = new UpdateTransactionDto();
        dto.id = transactionId;
        dto.status = nextStatus;

        try {
            await this.transactionService.updateOneTransaction(dto);
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
