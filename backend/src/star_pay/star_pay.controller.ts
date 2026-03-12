import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StarPayService } from './star_pay.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('star-pay')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class StarPayController {
    constructor(private readonly starPayService: StarPayService) {}

    @Post('create-order')
    createOrder(
        @Body('orderId') orderId: string,
        @Body('amount') amount: string
    ) {
        return this.starPayService.createOrder(orderId, amount);
    }
}
