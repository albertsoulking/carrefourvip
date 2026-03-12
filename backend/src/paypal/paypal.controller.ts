// paypal.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('paypal')
@Controller('paypal')
export class PaypalController {
    constructor(private readonly paypalService: PaypalService) {}

    @Post('create')
    async create(
        @Body('userId') userId: number,
        @Body('amount') amount: string
    ) {
        return this.paypalService.createOrder(userId, amount);
    }

    @Post('capture')
    async capture(
        @Body('userId') userId: number,
        @Body('orderId') orderId: string
    ) {
        return this.paypalService.captureOrder(userId, orderId);
    }
}
