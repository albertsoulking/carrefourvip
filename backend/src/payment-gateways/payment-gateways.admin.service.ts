import {
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

@Injectable()
export class PaymentGatewayAdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(PaymentGateway)
        private readonly gatewayRepo: Repository<PaymentGateway>,
        private readonly dataSource: DataSource,
        private readonly logService: LogService,
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
}
