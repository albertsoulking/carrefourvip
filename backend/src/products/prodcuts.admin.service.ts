import {
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entity/products.entity';
import { Between, DataSource, IsNull, Not, Repository } from 'typeorm';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UserMode } from 'src/users/enum/user.enum';
import { Admin } from 'src/admin/entities/admin.entity';
import { AdminService } from 'src/admin/admin.service';
import { SearchProductDto } from './dto/search-product.dto';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { PaymentStatus } from 'src/orders/enums/order.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';

@Injectable()
export class AdminProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly dataSource: DataSource,
        private readonly adminService: AdminService,
        private readonly logService: LogService,
        private readonly notiService: NotificationService
    ) {}

    async getOverviewData() {
        // 总商品数
        const totalProducts = await this.productRepo.count();

        // 上架商品数
        const availableProducts = await this.productRepo.count({
            where: { isAvailable: true }
        });

        // 本月新增商品数
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const newProducts = await this.productRepo.count({
            where: {
                createdAt: Between(startOfMonth, endOfMonth)
            }
        });

        // 热销商品数（近30天销量 ≥ 10）
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 30);

        const hotSellingProducts = await this.productRepo
            .createQueryBuilder('product')
            .innerJoin('product.orderItems', 'oi')
            .innerJoin('oi.user', 'u')
            .innerJoin('oi.order', 'order')
            .where('oi.createdAt >= :recentDate', { recentDate })
            .andWhere('u.mode = :mode', { mode: UserMode.LIVE })
            .andWhere('order.paymentStatus = :status', {
                status: PaymentStatus.PAID
            })
            .groupBy('product.id')
            .having('COALESCE(SUM(oi.quantity), 0) >= :minSold', {
                minSold: 10
            })
            .getRawMany();

        const overview = {
            totalProducts,
            availableProducts,
            newProducts,
            hotSellingProducts: hotSellingProducts.length
        };

        return overview;
    }

    async getAll(
        adminId: number,
        dto: SearchProductDto
    ): Promise<{
        overview: any;
        data: Product[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        const skip = (dto.page - 1) * dto.limit;
        const query = this.productRepo
            .createQueryBuilder('product')
            .leftJoin('product.category', 'category')
            .leftJoin('product.orderItems', 'orderItem')
            .leftJoin('orderItem.user', 'user')
            .leftJoin('orderItem.order', 'order')
            .select([
                'product.id',
                'product.name',
                'product.imageUrl',
                'product.imageList',
                'product.description',
                'product.attributes',
                'product.attrGroups',
                'product.price',
                'product.isAvailable',
                'product.createdAt',
                'category.id',
                'category.name',
                'category.description'
            ])
            .addSelect(
                `
                    COALESCE(SUM(
                        CASE WHEN order.paymentStatus = 'PAID' THEN orderItem.quantity ELSE 0 END
                    ), 0)
                `,
                'soldCount'
            )
            .groupBy('product.id')
            .addGroupBy('category.id');

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        if (dto.productId)
            query.andWhere('product.id = :productId', {
                productId: dto.productId
            });
        if (dto.name)
            query.andWhere('product.name LIKE :name', {
                name: `%${dto.name}%`
            });
        if (dto.description)
            query.andWhere('product.description LIKE :description', {
                description: `%${dto.description}%`
            });
        if (dto.isAvailable !== undefined)
            query.andWhere('product.isAvailable = :isAvailable', {
                isAvailable: dto.isAvailable === 1
            });
        if (dto.categoryId !== undefined)
            query.andWhere('category.id = :categoryId', {
                categoryId: dto.categoryId
            });
        // 金额区间
        if (dto.balanceGreaterThan)
            query.andWhere('product.price >= :balanceGreaterThan', {
                balanceGreaterThan: parseFloat(dto.balanceGreaterThan)
            });

        if (dto.balanceLessThan)
            query.andWhere('product.price <= :balanceLessThan', {
                balanceLessThan: parseFloat(dto.balanceLessThan)
            });
        // 时间范围
        if (dto.fromDate)
            query.andWhere('product.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });

        if (dto.toDate)
            query.andWhere('product.createdAt <= :toDate', {
                toDate: dto.toDate
            });

        const sortFieldMap = {
            actions: 'product.id',
            soldCount: 'soldCount'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `product.${dto.sortBy}`;

        if (dto.hasHot) {
            query
                .andWhere('orderItem.createdAt >= :recentDate', {
                    recentDate: dto.cusDate
                })
                .andWhere('user.mode = :mode', { mode: UserMode.LIVE })
                .andWhere('order.paymentStatus = :status', {
                    status: PaymentStatus.PAID
                })
                .having('COALESCE(SUM(orderItem.quantity), 0) >= :minSold', {
                    minSold: 10
                });

            const { entities, raw } = await query
                .skip(skip)
                .take(dto.limit)
                .orderBy(sortField, direction)
                .getRawAndEntities();

            const productData = entities.map((product, index) => ({
                ...product,
                soldCount: parseInt(raw[index].soldCount, 10)
            }));

            const countQuery = query.clone();
            countQuery
                .select('product.id')
                .skip(skip)
                .take(dto.limit)
                .orderBy(sortField, direction);

            const rawTotal = await countQuery.getRawMany();
            const total = rawTotal.length;

            return {
                overview: await this.getOverviewData(),
                data: productData,
                total,
                page: dto.page,
                lastPage: Math.ceil(total / dto.limit)
            };
        }

        const { entities, raw } = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getRawAndEntities();

        const productData = entities.map((product, index) => ({
            ...product,
            soldCount: parseInt(raw[index].soldCount, 10)
        }));

        const countQuery = query.clone().select('product.id');
        const total = await countQuery.getCount();

        const products = {
            overview: await this.getOverviewData(),
            data: productData,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        await this.adminService.updateLastLogin(admin.id);

        return products;
    }

    async update(adminId: number, dto: UpdateProductDto, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            // check product
            const updateProduct = await this.productRepo.findOne({
                where: { id: dto.id },
                relations: ['category']
            });
            if (!updateProduct) {
                throw new NotFoundException(
                    `Product item with ID ${dto.id} not found`
                );
            }

            if (updateProduct.name !== dto.name && dto.name !== undefined) {
                await this.logService.logAdminAction(req, {
                    adminId: admin.id,
                    userType: UserType.ADMIN,
                    action: '更新名称',
                    targetType: '商品',
                    targetId: updateProduct.id,
                    description: `[${admin.name}] 修改了商品名称：'${updateProduct.name}' -> '${dto.name}' `
                });
            }

            if (
                updateProduct.description !== dto.description &&
                dto.description !== undefined
            ) {
                await this.logService.logAdminAction(req, {
                    adminId: admin.id,
                    userType: UserType.ADMIN,
                    action: '更新描述',
                    targetType: '商品',
                    targetId: updateProduct.id,
                    description: `[${admin.name}] 修改了商品描述：'${updateProduct.description}' -> '${dto.description}'`
                });
            }

            if (
                parseFloat(updateProduct.price) !==
                    parseFloat(dto.price || '') &&
                dto.price !== undefined
            ) {
                await this.logService.logAdminAction(req, {
                    adminId: admin.id,
                    userType: UserType.ADMIN,
                    action: '更新价格',
                    targetType: '商品',
                    targetId: updateProduct.id,
                    description: `[${admin.name}] 修改了商品价格：'${updateProduct.price}' -> '${dto.price}'`
                });
            }

            if (
                updateProduct.imageUrl !== dto.imageUrl &&
                dto.imageUrl !== undefined
            ) {
                await this.logService.logAdminAction(req, {
                    adminId: admin.id,
                    userType: UserType.ADMIN,
                    action: '更新图片',
                    targetType: '商品',
                    targetId: updateProduct.id,
                    description: `[${admin.name}] 修改了商品图片：'${updateProduct.imageUrl}' -> '${dto.imageUrl}'`
                });
            }

            if (
                updateProduct.category.id !== dto.categoryId &&
                dto.categoryId !== undefined
            ) {
                await this.logService.logAdminAction(req, {
                    adminId: admin.id,
                    userType: UserType.ADMIN,
                    action: '更换分类',
                    targetType: '商品',
                    targetId: updateProduct.id,
                    description: `[${admin.name}] 更换了商品分类：'${updateProduct.categoryId}' -> '${dto.categoryId}'`
                });
            }

            if (
                updateProduct.isAvailable !== dto.isAvailable &&
                dto.isAvailable !== undefined
            ) {
                await this.logService.logAdminAction(req, {
                    adminId: admin.id,
                    userType: UserType.ADMIN,
                    action: '更新状态',
                    targetType: '商品',
                    targetId: updateProduct.id,
                    description: `[${admin.name}] 修改了商品状态：'${updateProduct.isAvailable ? '启用' : '禁用'}' -> '${dto.isAvailable ? '启用' : '禁用'}'`
                });
            }

            if (
                updateProduct.imageList !== dto.imageList &&
                dto.imageList !== undefined
            ) {
                await this.logService.logAdminAction(req, {
                    adminId: admin.id,
                    userType: UserType.ADMIN,
                    action: '更新图片',
                    targetType: '商品',
                    targetId: updateProduct.id,
                    description: `[${admin.name}] 修改了商品图片：'${updateProduct.imageList}' -> '${dto.imageList}'`
                });
            }

            if (
                updateProduct.attributes !== dto.attributes &&
                dto.attributes !== undefined
            ) {
                await this.logService.logAdminAction(req, {
                    adminId: admin.id,
                    userType: UserType.ADMIN,
                    action: '更新属性变体',
                    targetType: '商品',
                    targetId: updateProduct.id,
                    description: `[${admin.name}] 修改了商品属性变体：'${updateProduct.attributes}' -> '${dto.attributes}'`
                });
            }

            if (
                updateProduct.attrGroups !== dto.attrGroups &&
                dto.attrGroups !== undefined
            ) {
                await this.logService.logAdminAction(req, {
                    adminId: admin.id,
                    userType: UserType.ADMIN,
                    action: '更新属性分组',
                    targetType: '商品',
                    targetId: updateProduct.id,
                    description: `[${admin.name}] 修改了商品属性分组：'${updateProduct.attrGroups}' -> '${dto.attrGroups}'`
                });
            }

            await this.adminService.updateLastLogin(admin.id);
            await this.productRepo.update(dto.id, dto);
            await this.notiService.sendNotification({
                title: '更新商品',
                content: `${admin.name} 更新了 商品[ID: ${updateProduct.id}/${updateProduct.name}]`,
                type: NotificationType.PRODUCT,
                path: '/products',
                createdAt: new Date(),
                userId: admin.id,
                targetId: updateProduct.id,
                userType: UserType.ADMIN,
                enableNoti: 0
            });
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async create(adminId: number, dto: CreateProductDto, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            let product = this.productRepo.create(dto);
            product = await this.productRepo.save(product);
            await this.adminService.updateLastLogin(admin.id);
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '添加商品',
                targetType: '商品',
                targetId: product.id,
                description: `[${admin.name}] 添加了新商品：${product.name}`
            });
            await this.notiService.sendNotification({
                title: '创建商品',
                content: `${admin.name} 创建了 商品[ID: ${product.id}/${product.name}]`,
                type: NotificationType.PRODUCT,
                path: '/products',
                createdAt: new Date(),
                userId: admin.id,
                targetId: product.id,
                userType: UserType.ADMIN,
                enableNoti: 0
            });
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async delete(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const product = await this.productRepo.findOneBy({ id });
            if (!product)
                throw new NotFoundException(`Product ID ${id} not found!`);

            product.isAvailable = false;
            await this.productRepo.save(product);
            await this.productRepo.softDelete(id);
            await this.adminService.updateLastLogin(admin.id);
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '软删除商品',
                targetType: '商品',
                targetId: id,
                description: `[${admin.name}] 删除了该商品：${product.name}`
            });
            await this.notiService.sendNotification({
                title: '删除商品',
                content: `${admin.name} 删除了 商品[ID: ${product.id}/${product.name}]`,
                type: NotificationType.PRODUCT,
                path: '/products',
                createdAt: new Date(),
                userId: admin.id,
                targetId: product.id,
                userType: UserType.ADMIN,
                enableNoti: 0
            });
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async getDeletedOverviewData() {
        // 总商品数
        const totalDeletedProducts = await this.productRepo.count({
            withDeleted: true,
            where: { deletedAt: Not(IsNull()) }
        });

        // 本月新增商品数
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const oldProducts = await this.productRepo.count({
            withDeleted: true,
            where: {
                deletedAt: Between(startOfMonth, endOfMonth)
            }
        });

        const overview = {
            totalDeletedProducts,
            oldProducts
        };

        return overview;
    }

    async getDeleted(
        adminId: number,
        dto: SearchProductDto
    ): Promise<{
        overview: any;
        data: Product[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        const skip = (dto.page - 1) * dto.limit;
        const query = this.productRepo
            .createQueryBuilder('product')
            .withDeleted()
            .leftJoin('product.category', 'category')
            .leftJoin('product.orderItems', 'orderItem')
            .leftJoin('orderItem.user', 'user')
            .leftJoin('orderItem.order', 'order')
            .select([
                'product.id',
                'product.name',
                'product.imageUrl',
                'product.description',
                'product.price',
                'product.isAvailable',
                'product.createdAt',
                'product.deletedAt',
                'category.id',
                'category.name'
            ])
            .addSelect(
                `
                    COALESCE(SUM(
                        CASE WHEN order.paymentStatus = 'PAID' THEN orderItem.quantity ELSE 0 END
                    ), 0)
                `,
                'soldCount'
            )
            .groupBy('product.id')
            .addGroupBy('category.id');

        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        if (dto.productId)
            query.andWhere('product.id = :productId', {
                productId: dto.productId
            });
        if (dto.name)
            query.andWhere('product.name LIKE :name', {
                name: `%${dto.name}%`
            });
        if (dto.description)
            query.andWhere('product.description LIKE :description', {
                description: `%${dto.description}%`
            });
        if (dto.isAvailable !== undefined)
            query.andWhere('product.isAvailable = :isAvailable', {
                isAvailable: dto.isAvailable === 1
            });
        if (dto.categoryId !== undefined)
            query.andWhere('category.id = :categoryId', {
                categoryId: dto.categoryId
            });
        // 金额区间
        if (dto.balanceGreaterThan)
            query.andWhere('product.price >= :balanceGreaterThan', {
                balanceGreaterThan: parseFloat(dto.balanceGreaterThan)
            });

        if (dto.balanceLessThan)
            query.andWhere('product.price <= :balanceLessThan', {
                balanceLessThan: parseFloat(dto.balanceLessThan)
            });
        // 时间范围
        if (dto.fromDate)
            query.andWhere('product.deletedAt >= :fromDate', {
                fromDate: dto.fromDate
            });

        if (dto.toDate)
            query.andWhere('product.deletedAt <= :toDate', {
                toDate: dto.toDate
            });

        query.andWhere('product.deletedAt IS NOT NULL');

        const sortFieldMap = {
            actions: 'product.id',
            soldCount: 'soldCount'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `product.${dto.sortBy}`;

        const { entities, raw } = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getRawAndEntities();

        const productData = entities.map((product, index) => ({
            ...product,
            soldCount: parseInt(raw[index].soldCount, 10)
        }));

        const countQuery = query.clone().select('product.id');
        const total = await countQuery.getCount();

        const products = {
            overview: await this.getDeletedOverviewData(),
            data: productData,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        await this.adminService.updateLastLogin(admin.id);

        return products;
    }

    async restore(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const deleted = await this.productRepo.findOne({
                where: { id },
                withDeleted: true
            });
            if (!deleted)
                throw new NotFoundException(
                    `Deleted Product ID ${id} not found!`
                );

            await this.productRepo.restore(id);
            await this.adminService.updateLastLogin(admin.id);
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '恢复商品',
                targetType: '商品',
                targetId: id,
                description: `[${admin.name}] 恢复了该商品：${deleted.name}`
            });
            await this.notiService.sendNotification({
                title: '恢复商品',
                content: `${admin.name} 恢复了 商品[ID: ${deleted.id}/${deleted.name}]`,
                type: NotificationType.PRODUCT,
                path: '/products',
                createdAt: new Date(),
                userId: admin.id,
                targetId: deleted.id,
                userType: UserType.ADMIN,
                enableNoti: 0
            });
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(error.message);
        } finally {
            await queryRunner.release();
        }
    }
}
