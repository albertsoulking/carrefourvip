// pay2s.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { OrderStatus, PaymentStatus } from 'src/orders/enums/order.enum';
import { Repository } from 'typeorm';
import * as CryptoJS from 'crypto-js';
import { UserMode } from 'src/users/enum/user.enum';
import { Setting } from 'src/settings/entity/setting.entity';
import { OrdersService } from 'src/orders/orders.service';
import { Order } from 'src/orders/entities/order.entity';
import { Request } from 'express';

@Injectable()
export class Pay2sService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        private readonly orderService: OrdersService
    ) {}

    async updatePayment(body: any, req: Request) {
        const { orderId, resultCode } = body;

        // 示例日志
        console.log('💰 Pay2s Webhook 接收到:', body);

        if (resultCode === 0) {
            // success
            // 更新数据库中订单状态
            await this.orderService.updateOrderStatus(req, {
                id: Number(orderId),
                status: OrderStatus.PENDING,
                paymentStatus: PaymentStatus.PAID
            });

            console.log(`✅ 订单 ${orderId} 已标记为已支付`);
        }
    }

    async createPayment(orderId: string, mode: UserMode) {
        const settings = await this.settingRepo.find({
            where: { group: 'pay2s' }
        });
        if (!settings || settings.length === 0)
            throw new NotFoundException('Pay2s setting not found');

        const order = await this.orderRepo.findOne({
            where: { id: Number(orderId) }
        });
        if (!order)
            throw new NotFoundException(`Order ID ${orderId} not found!`);

        // 默认值
        const endpoint = `https://${mode === UserMode.LIVE ? '' : 'sandbox-'}payment.pay2s.vn/v1/gateway/api/create`;
        const accessKey = settings.find(
            (item) => item.key === `access_key_${mode}`
        )!.value;
        const secretKey = settings.find(
            (item) => item.key === `secret_key_${mode}`
        )!.value;
        const orderInfo = `Total products ${order.quantity}`;
        const partnerCode = settings.find(
            (item) => item.key === `partner_code_${mode}`
        )!.value;
        const redirectUrl = `${process.env.HOST_BASE_URL}/payment/pay2s`;
        const ipnUrl = `${process.env.API_BASE_URL}/api/pay2s/webhook`;
        const requestId = Date.now() + '';
        const requestType = 'pay2s';
        const orderType = order.deliveryMethod;
        const partnerName = 'Carrefour';
        const bank_accounts = settings.find(
            (item) => item.key === `bank_account_${mode}`
        )!.value;
        const exchange_rate = 27000; // vnd
        const due_amount = Number(order.payAmount) * exchange_rate;

        // 转换银行账户列表
        const lines = bank_accounts.split('\n');
        const bankList = lines.map((line) => {
            const [accountNumber, bankId] = line.trim().split('|');
            return {
                account_number: accountNumber.trim(),
                bank_id: bankId.trim().toUpperCase()
            };
        });

        // 生成 HMAC SHA256 签名
        const rawHash = `accessKey=${accessKey}&amount=${due_amount}&bankAccounts=Array&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = CryptoJS.HmacSHA256(rawHash, secretKey).toString(
            CryptoJS.enc.Hex
        );

        // 发送数据
        const data = {
            accessKey,
            partnerCode,
            partnerName,
            requestId,
            amount: due_amount,
            orderId,
            orderInfo,
            orderType,
            bankAccounts: bankList,
            redirectUrl,
            ipnUrl,
            requestType,
            signature
        };

        try {
            const response = await axios.post(endpoint, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error(
                'Error:',
                error.response ? error.response.data : error.message
            );
        }
    }
}
