import {
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { PaymentGateway } from './entities/payment-gateway.entity';

@Injectable()
export class PaymentGatewayService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(PaymentGateway)
        private readonly gatewayRepo: Repository<PaymentGateway>
    ) {}

    async getAll(userId: number) {
        try {
            const user = await this.userRepo.findOne({
                where: { id: userId }
            });
            if (!user)
                throw new NotFoundException(`User ID ${userId} not found!`);

            const gateways = await this.gatewayRepo.find({
                where: { visible: 1 },
                relations: ['provider'],
                select: {
                    id: true,
                    name: true,
                    provider: {
                        id: true,
                        name: true,
                        code: true
                    },
                    logo: true,
                    images: true,
                    notes: true,
                    notices: true,
                    status: true,
                    exLogos: true,
                    discount: true,
                    blackList: true,
                    config: true,
                    isManual: true
                },
                order: {
                    sortOrder: 'ASC'
                }
            });

            const frontendGateways = gateways.map((g) => {
                const config = JSON.parse(g.config || '{}');
                const notes = JSON.parse(g.notes || '[]').filter(
                    (n: any) => n.visible === 1
                );
                const notices = JSON.parse(g.notices || '[]').filter(
                    (n: any) => n.visible === 1
                );
                const blackList = g.blackList
                    ? g.blackList
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [];
                const images = g.images
                    ? g.images
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [];
                const exLogos = g.exLogos
                    ? g.exLogos
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [];

                return {
                    ...g,
                    config: config.frontend || {},
                    notes,
                    notices,
                    blackList,
                    images,
                    exLogos
                };
            });

            return frontendGateways;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async get(userId: number, payMethod: string) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException(`User ID ${userId} not found!`);

        const gateway = await this.gatewayRepo.findOne({
            where: { provider: { code: payMethod } },
            relations: ['provider'],
            select:{
                id: true,
                isManual: true,
                config: true,
                provider: {
                    id: true,
                    name: true,
                    code: true,
                    type: true
                }
            }
        });

        return gateway;
    }
}
