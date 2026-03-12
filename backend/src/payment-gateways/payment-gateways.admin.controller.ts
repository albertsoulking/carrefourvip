import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth
} from '@nestjs/swagger';
import { PaymentGatewayAdminService } from './payment-gateways.admin.service';
import { CreatePaymentGatewayDto } from './dto/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from './dto/update-payment-gateway.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';
import { SearchPaymentGatewayDto } from './dto/search-payment-gateway.dto';

@ApiTags('admin/payment-gateways')
@Controller('admin/payment-gateways')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentGatewayAdminController {
    constructor(
        private readonly gatewayService: PaymentGatewayAdminService
    ) {}

    @Post('create-payment-gateway')
    create(@Req() req: Request, @Body() dto: CreatePaymentGatewayDto) {
        const adminId = (req as any)?.user.id;
        return this.gatewayService.create(adminId, dto, req);
    }

    @Post('get-all-payment-gateways')
    getAll(@Req() req: Request, @Body() dto: SearchPaymentGatewayDto) {
        const adminId = (req as any)?.user.id;
        return this.gatewayService.getAll(adminId, dto);
    }

    @Post('update-payment-gateway')
    update(@Req() req: Request, @Body() dto: UpdatePaymentGatewayDto) {
        const adminId = (req as any)?.user.id;
        return this.gatewayService.update(adminId, dto, req);
    }
}
