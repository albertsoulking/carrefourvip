import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { PaymentGatewayService } from "./payment-gateway.service";
import { Request } from "express";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('payment-gateway')
export class PaymentGatewayController {
    constructor(private readonly gatewayService: PaymentGatewayService) {}

    @Post('get-all-gateways')
    getAll(@Req() req: Request) {
        const userId = (req as any)?.user.id;
        return this.gatewayService.getAll(userId);
    }

    @Post('get-one-gateway')
    get(@Req() req: Request, @Body('payMethod') payMethod: string) {
        const userId = (req as any)?.user.id;
        return this.gatewayService.get(userId, payMethod)
    }
}
