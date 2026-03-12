import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { LemonService } from './lemon.service';

@Controller('lemon')
export class LemonController {
    constructor(private lemonService: LemonService) {}

    @Post('checkout')
    createCheckout() {
        return this.lemonService.createCheckout();
    }

    @Post('lemon-webhook')
    // @UseGuards(RawBodyMiddleware) // 如果你要验证签名
    handleWebhook(@Req() req: Request) {
        const event = req.body;
        // 根据 event 类型处理
    }
}
