import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentProvider } from './entities/payment-provider.entity';
import { Repository } from 'typeorm';
import { Admin } from 'src/admin/entities/admin.entity';

@Injectable()
export class PaymentProviderAdminService {
    constructor(
        @InjectRepository(PaymentProvider)
        private readonly providerRepo: Repository<PaymentProvider>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>
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
}
