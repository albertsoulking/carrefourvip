import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { MD5 } from 'crypto-js';
import { Order } from 'src/orders/entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StarPayService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>
    ) {}
    async createOrder(orderId: string, amount: string) {
        // const settings = await this.settingRepo.find({
        //     where: { group: 'pay2s' }
        // });
        // if (!settings || settings.length === 0) throw new NotFoundException('Pay2s setting not found');

        const order = await this.orderRepo.findOne({
            where: { id: Number(orderId) }
        });
        if (!order)
            throw new NotFoundException(`Order ID ${orderId} not found!`);

        // 默认值
        const endpoint = 'https://api.star-pay.vip/api/gateway/pay';
        const key = 'd40bd388a29b3a407e5418cc159c8a02';
        const merchant_no = '072151';
        const timestamp = Date.now() + '';
        const sign_type = 'MD5';
        const params = JSON.stringify({
            merchant_ref: orderId,
            product: 'TRC20Buy',
            amount: amount,
            extra: {
                fiat_currency: 'EUR'
            },
            extend_params: '',
            notify_url: '',
            return_url: `${process.env.HOST_BASE_URL}/payment/pay2s`
        });
        const sign = MD5(merchant_no + params + sign_type + timestamp + key);

        // 发送数据
        const data = {
            merchant_no,
            timestamp,
            sign_type,
            sign,
            params
        };

        try {
            const response = await axios.post(endpoint, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            if (response.data.code === 200) {
                const params = JSON.parse(response.data.params);
                order.paymentLink = params.payurl;
                await this.orderRepo.save(order);
            }

            return response.data;
        } catch (error) {
            console.error(
                'Error:',
                error.response ? error.response.data : error.message
            );
        }
    }
}
