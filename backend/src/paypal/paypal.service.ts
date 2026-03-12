// paypal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as paypal from '@paypal/checkout-server-sdk';
import { Setting } from 'src/settings/entity/setting.entity';
import { User } from 'src/users/entities/user.entity';
import { UserMode } from 'src/users/enum/user.enum';
import { Repository } from 'typeorm';

@Injectable()
export class PaypalService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {}

    async paypalClient(userId: number | undefined) {
        let user: any = null;
        if (userId)
            user = await this.userRepo.findOne({
                where: { id: userId },
                select: {
                    id: true,
                    mode: true
                }
            });

        const setting = await this.settingRepo.findBy({
            group: 'paypal'
        });
        if (!setting) throw new NotFoundException('Invalid PayPal Value!');

        const userMode = user?.mode ?? UserMode.LIVE; // test / live
        const isLive = userMode === UserMode.LIVE;

        const clientId = setting.find(
            (s) => s.key === `client_id_${userMode}`
        )?.value;
        const secret = setting.find(
            (s) => s.key === `secret_key_${userMode}`
        )?.value;
        
        const environment = isLive
            ? new paypal.core.LiveEnvironment(clientId ?? '', secret ?? '')
            : new paypal.core.SandboxEnvironment(clientId ?? '', secret ?? '');

        const client = new paypal.core.PayPalHttpClient(environment);

        return client;
    }

    async createOrder(userId: number | undefined, amount: string) {
        const client = await this.paypalClient(userId);

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'EUR',
                        value: amount
                    }
                }
            ]
        });

        const response = await client.execute(request);
        return response.result;
    }

    async captureOrder(userId: number | undefined, orderId: string) {
        const client = await this.paypalClient(userId);

        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        const response = await client.execute(request);
        return response.result;
    }
}
