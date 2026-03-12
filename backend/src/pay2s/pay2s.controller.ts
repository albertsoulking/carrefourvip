import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Pay2sService } from './pay2s.service';
import { UserMode } from 'src/users/enum/user.enum';
import { Request } from 'express';

// pay2s.controller.ts
@Controller('pay2s')
export class Pay2sController {
    constructor(private readonly pay2sService: Pay2sService) {}

    @Post('create')
    async create(@Body() body: { orderId: number; mode: UserMode }) {
        return await this.pay2sService.createPayment(
            body.orderId.toString(),
            body.mode
        );
    }

    // pay2s.controller.ts

    @Post('webhook')
    @HttpCode(200) // 重要：Pay2s 只看状态码
    async webhook(@Req() req: Request, @Body() body: any) {
        const result = await this.pay2sService.updatePayment(body, req);
        return { success: result };
    }
}
