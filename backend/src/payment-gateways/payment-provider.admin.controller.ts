import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentProviderAdminService } from './payment-provider.admin.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('admin/payment-providers')
export class PaymentProviderAdminController {
    constructor(
        private readonly providerService: PaymentProviderAdminService
    ) {}

    @Post('get-all-providers')
    getAll(@Req() req: Request) {
        const adminId = (req as any)?.user.id;
        return this.providerService.getAll(adminId);
    }

    @Post('reset-providers')
    reset() {
        return this.providerService.reset();
    }
}
