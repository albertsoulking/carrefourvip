import {
    Inject,
    forwardRef,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { CreatePaymentGatewayDto } from './dto/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from './dto/update-payment-gateway.dto';
import { LogService } from 'src/system_log/log.service';
import { Admin } from 'src/admin/entities/admin.entity';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { Request } from 'express';
import { SearchPaymentGatewayDto } from './dto/search-payment-gateway.dto';
import { AdminService } from 'src/admin/admin.service';
import { PaymentProvider } from './entities/payment-provider.entity';

@Injectable()
export class PaymentGatewayAdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(PaymentGateway)
        private readonly gatewayRepo: Repository<PaymentGateway>,
        @InjectRepository(PaymentProvider)
        private readonly providerRepo: Repository<PaymentProvider>,
        private readonly dataSource: DataSource,
        private readonly logService: LogService,
        @Inject(forwardRef(() => AdminService))
        private readonly adminService: AdminService
    ) {}

    async create(
        adminId: number,
        dto: CreatePaymentGatewayDto,
        req: Request
    ): Promise<PaymentGateway> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not foudn!`);

        try {
            let gateway: any = null;
            gateway = this.gatewayRepo.create({
                ...dto,
                provider: { id: dto.providerId }
            });
            gateway = await this.gatewayRepo.save(gateway);

            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '创建支付通道',
                targetType: '支付通道',
                targetId: gateway.id,
                description: `[${admin.name}] 创建了支付通道：${gateway.name}`
            });

            await queryRunner.commitTransaction();
            return gateway;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        } finally {
            await queryRunner.release();
        }
    }

    async getAll(adminId: number, dto: SearchPaymentGatewayDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });
        if (!admin) {
            throw new NotFoundException('Invalid User ID');
        }

        const skip = (dto.page - 1) * dto.limit;
        const query = this.gatewayRepo
            .createQueryBuilder('gateway')
            .leftJoin('gateway.provider', 'provider')
            .select([
                'gateway.id',
                'gateway.name',
                'gateway.logo',
                'gateway.status',
                'gateway.sortOrder',
                'gateway.createdAt',
                'gateway.images',
                'gateway.notes',
                'gateway.notices',
                'gateway.exLogos',
                'gateway.discount',
                'gateway.blackList',
                'gateway.isManual',
                'gateway.visible',
                'gateway.config',
                'provider.id',
                'provider.name',
                'provider.code',
                'provider.type'
            ]);

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';
        if (dto.gatewayId)
            query.andWhere('gateway.id = :gatewayId', {
                gatewayId: dto.gatewayId
            });
        if (dto.name)
            query.andWhere('gateway.name LIKE :name', {
                name: `%${dto.name}%`
            });
        if (dto.providerId !== undefined)
            query.andWhere('provider.id = :providerId', {
                providerId: dto.providerId
            });
        if (dto.type !== undefined)
            query.andWhere('provider.type = :type', { type: dto.type });
        if (dto.fromDate)
            query.andWhere('gateway.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('gateway.createdAt <= :toDate', {
                toDate: dto.toDate
            });

        const sortFieldMap = {
            actions: 'gateway.id',
            'provider.name': 'provider.name'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `gateway.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        const gateways = {
            overview: null,
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        return gateways;
    }

    async update(adminId: number, dto: UpdatePaymentGatewayDto, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const admin = await this.adminRepo.findOne({
                where: { id: adminId }
            });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const gateway = await this.gatewayRepo.findOne({
                where: { id: dto.id }
            });
            if (!gateway)
                throw new NotFoundException('Payment Gateway Not Found!');

            if (
                gateway.logo !== dto.logo &&
                dto.logo !== undefined &&
                dto.logo !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新图标',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的图标：'${gateway.logo}' -> '${dto.logo}'`
                });
                gateway.logo = dto.logo;
            }

            if (
                gateway.name !== dto.name &&
                dto.name !== undefined &&
                dto.name !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新名称',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的名称：'${gateway.name}' -> '${dto.name}'`
                });
                gateway.name = dto.name;
            }

            if (
                gateway.images !== dto.images &&
                dto.images !== undefined &&
                dto.images !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新多图标',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的右侧多个图标：'${gateway.images}' -> '${dto.images}'`
                });
                gateway.images = dto.images;
            }

            if (
                gateway.notes !== dto.notes &&
                dto.notes !== undefined &&
                dto.notes !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新提示信息',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的提示信息：'${gateway.notes}' -> '${dto.notes}'`
                });
                gateway.notes = dto.notes;
            }

            if (
                gateway.notices !== dto.notices &&
                dto.notices !== undefined &&
                dto.notices !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新通知信息',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的通知信息：'${gateway.notices}' -> '${dto.notices}'`
                });
                gateway.notices = dto.notices;
            }

            if (
                gateway.exLogos !== dto.exLogos &&
                dto.exLogos !== undefined &&
                dto.exLogos !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新提示多图标',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的提示多图标：'${gateway.exLogos}' -> '${dto.exLogos}'`
                });
                gateway.exLogos = dto.exLogos;
            }

            if (
                gateway.status !== dto.status &&
                dto.status !== undefined &&
                dto.status !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新状态',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的状态：'${gateway.status}' -> '${dto.status}'`
                });
                gateway.status = dto.status;
            }

            if (
                gateway.sortOrder !== dto.sortOrder &&
                dto.sortOrder !== undefined &&
                dto.sortOrder !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新排序',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的排序：'${gateway.sortOrder}' -> '${dto.sortOrder}'`
                });
                gateway.sortOrder = dto.sortOrder;
            }

            if (
                gateway.discount !== dto.discount &&
                dto.discount !== undefined &&
                dto.discount !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新优惠',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的优惠：'${gateway.discount}%' -> '${dto.discount}%'`
                });
                gateway.discount = dto.discount;
            }

            if (
                gateway.blackList !== dto.blackList &&
                dto.blackList !== undefined &&
                dto.blackList !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新黑名单',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的黑名单：'${gateway.blackList}' -> '${dto.blackList}'`
                });
                gateway.blackList = dto.blackList;
            }

            if (
                gateway.isManual !== dto.isManual &&
                dto.isManual !== undefined &&
                dto.isManual !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新支付形式',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的支付形式：'${gateway.isManual === 1 ? '手动提交链接' : '自动网关支付'}' -> '${dto.isManual === 1 ? '手动提交链接' : '自动网关支付'}'`
                });
                gateway.isManual = dto.isManual;
            }

            if (
                gateway.visible !== dto.visible &&
                dto.visible !== undefined &&
                dto.visible !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新前端显示',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的前端显示：'${gateway.visible === 1 ? '是' : '否'}' -> '${dto.visible === 1 ? '是' : '否'}'`
                });
                gateway.visible = dto.visible;
            }

            if (
                gateway.config !== dto.config &&
                dto.config !== undefined &&
                dto.config !== null
            ) {
                await this.logService.logAdminAction(req, {
                    adminId,
                    userType: UserType.ADMIN,
                    action: '更新网关配置',
                    targetType: '支付通道',
                    targetId: gateway.id,
                    description: `[${admin.name}] 修改了支付通道的网关配置：'${gateway.config}' -> '${dto.config}'`
                });
                gateway.config = dto.config;
            }

            await this.adminService.updateLastLogin(admin.id);
            await this.gatewayRepo.save(gateway);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error);
        } finally {
            await queryRunner.release();
        }
    }

    async reset() {
        const defaultData = [
            {
                name: 'PayPal',
                providerCode: 'paypal',
                logo: '1757362821245-8kzmk4h9y.png',
                config: JSON.stringify({
                    frontend: {
                        client_id_test:
                            process.env.PAYPAL_CLIENT_ID_TEST ?? '',
                        client_id_live:
                            process.env.PAYPAL_CLIENT_ID_LIVE ?? '',
                        currency: 'EUR'
                    },
                    backend: {
                        secret_key_test:
                            process.env.PAYPAL_SECRET_KEY_TEST ?? '',
                        secret_key_live:
                            process.env.PAYPAL_SECRET_KEY_LIVE ?? '',
                        currency: 'EUR'
                    }
                }),
                notes: JSON.stringify([
                    {
                        text: "When using PayPal to pay, only \'Pay Now\' is supported. Other deferred payment methods such as \'Pay After 30 Days\' are not supported. Otherwise, your payment will be invalid.",
                        color: 'error',
                        visible: 1
                    }
                ]),
                notices: JSON.stringify([
                    {
                        text: 'PayPal system is currently under maintenance.',
                        color: 'error',
                        visible: 1
                    }
                ])
            },
            {
                name: 'Stripe',
                providerCode: 'stripe',
                logo: '1757363701486-1z29efea9.png',
                images: '1757363566214-f24c7p8hy.png',
                exLogos:
                    '1757363598923-3k2517f9l.png,1757363605883-l5a5ysft4.png,1757363612133-obgu4glss.png,1757363619496-ozmnq0j8h.png,1757363627464-rqha2pzq1.png,1757363633768-9n3k79pyc.png',
                config: JSON.stringify({
                    frontend: {
                        pk_test: process.env.STRIPE_PK_TEST ?? '',
                        pk_live: process.env.STRIPE_PK_LIVE ?? ''
                    },
                    backend: {
                        sk_test: process.env.STRIPE_SK_TEST ?? '',
                        sk_live: process.env.STRIPE_SK_LIVE ?? ''
                    }
                })
            },
            {
                name: 'Lemon Squeezy',
                providerCode: 'lemon',
                logo: '757363677615-x1z0i034x.jpg',
                config: JSON.stringify({
                    frontend: {
                        api_key_pk_test:
                            process.env.LEMON_API_KEY_PK_TEST ?? '',
                        api_key_pk_live:
                            process.env.LEMON_API_KEY_PK_LIVE ?? ''
                    },
                    backend: {
                        api_key_sk_test:
                            process.env.LEMON_API_KEY_SK_TEST ?? '',
                        api_key_sk_live:
                            process.env.LEMON_API_KEY_SK_LIVE ?? ''
                    }
                })
            },
            {
                name: 'Behalf Payment',
                providerCode: 'behalf',
                notes: JSON.stringify([
                    {
                        text: 'Share with friends to pay on your behalf',
                        color: 'textDisabled',
                        visible: 1
                    }
                ])
            },
            {
                name: 'Bank Card',
                providerCode: 'card',
                logo: '1757363033593-fh8zd2g2w.png',
                images: '1757363080448-s9q3yhykj.png,1757363086546-sa0vrenlz.png,1757363253865-e6w8o3lrn.png,1757363259477-jb5ejrwxy.png,1757363263792-gdvyz4s12.png',
                config: JSON.stringify({
                    frontend: {
                        accountName: 'HKD CARREFOURVIP LLC',
                        accountNumber: '1040746688',
                        bankName: 'Vietcombank',
                        swiftCode: 'BFTVVNVX',
                        bankAddress:
                            '198 Tran Quang Khai Street, Hanoi, Vietnam',
                        note: 'As you are an international payment user, a Carrefour corporate collection account has been randomly assigned to you. Please transfer the payment to this account. Once Carrefour confirms receipt of your payment, we will proceed with the shipment.'
                    }
                }),
                notices: JSON.stringify({
                    text: 'The bank card system is currently under maintenance.',
                    color: 'error',
                    visible: 1
                }),
                exLogos:
                    '757363336023-5e51y9utd.png,1757363343294-44vmvru6e.png,1757363350133-zlflnugep.png,1757363355469-wp8xf9c5d.png,1757363362905-gl4yq8fst.png,1757363368468-qql1nxpg8.png,1757363374527-ro8x97ak7.png,1757363380726-a5wda91px.png'
            },
            {
                name: 'Pay with Pay2s',
                providerCode: 'pay2s',
                logo: '1757363828730-p0lrazq5r.jpg',
                images: '1757363833372-nuo55seg8.png',
                config: JSON.stringify({
                    frontend: {
                        access_key_test:
                            process.env.PAY2S_ACCESS_KEY_TEST ?? '',
                        access_key_live:
                            process.env.PAY2S_ACCESS_KEY_LIVE ?? '',
                        partner_code_test: 'PAY2S7EPF0SB1ZP27W71',
                        bank_account_test: '99999999|acb'
                    },
                    backend: {
                        secret_key_test:
                            process.env.PAY2S_SECRET_KEY_TEST ?? '',
                        secret_key_live:
                            process.env.PAY2S_SECRET_KEY_LIVE ?? '',
                        partner_code_live: 'PAY2SSK91H3KWR6IB6LJ',
                        bank_account_live: '1040746688|vcb'
                    }
                })
            },
            {
                name: 'Payment with Friends and Family',
                providerCode: 'faf',
                notes: JSON.stringify([
                    {
                        text: 'Please select payment by friends and family when making payment, otherwise the payment will be invalid.',
                        color: 'error',
                        visible: 1
                    }
                ]),
                exLogos:
                    '1757363903141-4sojgjatr.png,1757363928521-cfoy65v8k.png,1757363934764-pxgk7ssw5.png,1757363944844-zqchww4pu.png,1757363985481-0h1bygxd7.png,1757363993379-x5qy5jb7h.png'
            },
            {
                name: 'Star Payment',
                providerCode: 'starpay'
            },
            {
                name: 'Pay with Wise',
                providerCode: 'wise',
                logo: '1757362717637-zp85lwvic.jpg',
                notices: JSON.stringify([
                    {
                        text: 'Wise Payment is currently under maintenance, please wait a moment.',
                        color: 'error',
                        visible: 1
                    }
                ])
            }
        ];

        const providers = await this.providerRepo.find();
        const providerMap = new Map(
            providers.map((provider) => [provider.code, provider])
        );

        // ✅ 1. 清空表
        await this.gatewayRepo.clear();

        // ✅ 2. 插入数据
        const entities = defaultData.map((item) => {
            const { providerCode, ...gatewayData } = item;
            const provider = providerMap.get(providerCode);
            return {
                ...gatewayData,
                ...(provider ? { provider } : {})
            };
        });

        await this.gatewayRepo.save(entities as any[]);

        return {
            message: 'Payment methods reset successfully',
            count: entities.length
        };
    }
}
