import {
    OnQueueCompleted,
    OnQueueFailed,
    Process,
    Processor
} from '@nestjs/bull';
import { Job } from 'bull';
import { AuthService } from './auth.service';
import { LogoutDto } from './dto/logout.dto';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

@Processor('auth')
export class AuthProcessor {
    constructor(private readonly authService: AuthService) {}

    @Process('admin-logout')
    async handleAdminLogout(job: Job) {
        const { id, req } = job.data;
        console.log(
            `[AuthQuee] Admin ID: ${id} Logout at ${new Date()}`
        );

        const dto = new LogoutDto();
        dto.userId = id;
        dto.userType = UserType.ADMIN;

        try {
            await this.authService.logout(dto, req);
        } catch (error) {
            throw error;
        }
    }

    @Process('user-logout')
    async handleUserLogout(job: Job) {
        const { id, req } = job.data;
        console.log(
            `[AuthQuee] User ID: ${id} Logout at ${new Date()}`
        );

        const dto = new LogoutDto();
        dto.userId = id;
        dto.userType = UserType.USER;

        try {
            await this.authService.logout(dto, req);
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
