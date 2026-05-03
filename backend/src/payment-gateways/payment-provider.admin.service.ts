import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentProvider } from './entities/payment-provider.entity';
import { Repository } from 'typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { PaymentGatewayType } from './enum/payment-gateways.enum';
import { PaymentGatewayAdminService } from './payment-gateways.admin.service';

@Injectable()
export class PaymentProviderAdminService {
    constructor(
        @InjectRepository(PaymentProvider)
        private readonly providerRepo: Repository<PaymentProvider>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly gatewayAdminService: PaymentGatewayAdminService
    ) {}

    async getAll(adminId: number) {
        const admin = this.adminRepo.find({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        return this.providerRepo.find({
            select: {
                id: true,
                name: true,
                code: true
            }
        });
    }

    async reset() {
        await this.providerRepo.clear();

        const defaultProviders = [
            { name: 'PyaPal', code: 'paypal', type: PaymentGatewayType.WALLET, remark: '贝宝支付' },
            { name: 'Stripe', code: 'stripe', type: PaymentGatewayType.WALLET, remark: 'Stripe支付' },
            { name: 'Lemon Squeezy', code: 'lemon', type: PaymentGatewayType.WALLET, remark: 'Lemon Squeezy支付' },
            { name: 'Behalf Payment', code: 'behalf', type: PaymentGatewayType.WALLET, remark: '代付款' },
            { name: 'Bank Card', code: 'card', type: PaymentGatewayType.CARD, remark: '银行卡支付' },
            { name: 'Pay2s', code: 'pay2s', type: PaymentGatewayType.WALLET, remark: 'Pay2s支付' },
            { name: 'Star Pay', code: 'starpay', type: PaymentGatewayType.CRYPTO, remark: 'Star支付' },
            { name: 'Payment with Friend and Family', code: 'faf', type: PaymentGatewayType.WALLET, remark: '亲友付' },
            { name: 'Wise', code: 'wise', type: PaymentGatewayType.WALLET, remark: 'Wise支付' }
        ];

        const providerEntities = this.providerRepo.create(defaultProviders);
        await this.providerRepo.save(providerEntities);

        await this.gatewayAdminService.reset();
        return { message: 'Payment providers reset to default successfully' };
    }
}
