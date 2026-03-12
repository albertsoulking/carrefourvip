import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) {}

    @Post('checkout')
    async createSession(@Req() req: Request, @Body() body: any) {
        const userId = (req as any)?.user.id;
        return this.stripeService.createCheckoutSession(userId, body, req);
    }
}
