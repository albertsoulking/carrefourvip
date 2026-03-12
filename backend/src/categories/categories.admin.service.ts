import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Between, DataSource, IsNull, Not, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/admin/entities/admin.entity';
import { SearchCategoryDto } from './dto/search-category.dto';
import { Request } from 'express';
import { LogService } from 'src/system_log/log.service';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';

@Injectable()
export class AdminCategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly dataSource: DataSource,
        private readonly adminService: AdminService,
        private readonly logService: LogService,
        private readonly notiService: NotificationService
    ) {}

    async getOverviewData() {
        // 总分类数
        const totalCategories = await this.categoryRepo.count();

        //  有商品的分类数
        const activeCategories = await this.categoryRepo
            .createQueryBuilder('category')
            .innerJoin('category.products', 'product')
            .groupBy('category.id')
            .having('COUNT(product.id) > 0')
            .getCount();

        // 本月新增分类
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const newCategories = await this.categoryRepo.count({
            where: {
                createdAt: Between(startOfMonth, endOfMonth)
            }
        });

        //  商品最多的分类
        const topCategory = await this.categoryRepo
            .createQueryBuilder('category')
            .innerJoin('category.products', 'product')
            .groupBy('category.id')
            .addSelect('COUNT(product.id)', 'productCount')
            .orderBy('productCount', 'DESC')
            .limit(1)
            .getRawOne();

        const topCategoryName = topCategory?.category_name ?? 'N/A';
        const topCategoryCount = parseInt(topCategory?.productCount || '0', 10);

        const overview = {
            totalCategories,
            activeCategories,
            newCategories,
            topCategory: {
                name: topCategoryName,
                productCount: topCategoryCount
            }
        };

        return overview;
    }

    async getAllCategories(adminId: number, dto: SearchCategoryDto) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const query = this.categoryRepo
            .createQueryBuilder('category')
            .leftJoin('category.products', 'product')
            .select([
                'category.id',
                'category.name',
                'category.imageUrl',
                'category.description',
                'category.isActive',
                'category.displayOrder',
                'category.vatPercent',
                'category.isCollect',
                'category.createdAt',
                'category.bgImageUrl'
            ])
            .addSelect('COUNT(product.id)', 'productCount')
            .groupBy('category.id');

        if (dto.categoryId)
            query.andWhere('category.id = :categoryId', {
                categoryId: dto.categoryId
            });
        if (dto.name)
            query.andWhere('category.name LIKE :name', {
                name: `%${dto.name}%`
            });
        if (dto.description)
            query.andWhere('category.description LIKE :description', {
                description: `%${dto.description}%`
            });
        if (dto.isActive !== undefined)
            query.andWhere('category.isActive = :isActive', {
                isActive: dto.isActive === 1
            });
        if (dto.isCollect !== undefined)
            query.andWhere('category.isCollect = :isCollect', {
                isCollect: dto.isCollect === 1
            });
        // 金额区间（假设 user.balance 字段为 number）
        if (dto.balanceGreaterThan)
            query.andWhere('category.vatPercent >= :balanceGreaterThan', {
                balanceGreaterThan: parseFloat(dto.balanceGreaterThan)
            });

        if (dto.balanceLessThan)
            query.andWhere('category.vatPercent <= :balanceLessThan', {
                balanceLessThan: parseFloat(dto.balanceLessThan)
            });
        // 时间范围（假设 user.createdAt）
        if (dto.fromDate)
            query.andWhere('category.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('category.createdAt <= :toDate', {
                toDate: dto.toDate
            });
        if (dto.hasProduct) {
            query.having('COUNT(product.id) > 0');
        }
        if (dto.hasMost) {
            query.orderBy('productCount', 'DESC').limit(1);
            const { entities, raw } = await query.getRawAndEntities();
            const data = entities.map((cat, i) => ({
                ...cat,
                productCount: parseInt(raw[i]?.productCount ?? '0', 10)
            }));

            return {
                overview: await this.getOverviewData(),
                data,
                total: 1,
                page: 1,
                lastPage: 1
            };
        }

        const sortFieldMap = {
            actions: 'category.id',
            productCount: 'productCount'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `category.${dto.sortBy}`;
        const skip = (dto.page - 1) * dto.limit;
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        const { entities, raw } = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getRawAndEntities();

        const data = entities.map((cat, i) => ({
            ...cat,
            productCount: parseInt(raw[i]?.productCount ?? '0', 10)
        }));
        const countQuery = query.clone().select('category.id');
        const total = await countQuery.getCount();

        const categories = {
            overview: await this.getOverviewData(),
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        await this.adminService.updateLastLogin(admin.id);

        return categories;
    }

    async createCategory(
        adminId: number,
        dto: CreateCategoryDto,
        req: Request
    ) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found`);

        // check if category is empty
        if (dto.name === '')
            throw new InternalServerErrorException(
                'Category can not be empty!'
            );

        // check if catagory existed
        const isExisted = await this.categoryRepo.findOne({
            where: { name: dto.name }
        });
        if (isExisted)
            throw new InternalServerErrorException('Category already existed!');

        // Create the category
        const category = this.categoryRepo.create({
            ...dto
        });

        await this.categoryRepo.save(category);
        await this.adminService.updateLastLogin(admin.id);
        await this.logService.logAdminAction(req, {
            adminId: admin.id,
            userType: UserType.ADMIN,
            action: '添加分类',
            targetType: '分类',
            targetId: category.id,
            description: `[${admin.name}] 添加了新分类：${category.name}`
        });
        await this.notiService.sendNotification({
            title: '创建分类',
            content: `${admin.name} 创建了 分类 [ID: ${category.id}/${category.name}]`,
            type: NotificationType.CATEGORY,
            path: '/categories',
            createdAt: new Date(),
            userId: admin.id,
            targetId: category.id,
            userType: UserType.ADMIN,
            enableNoti: 0
        });
    }

    async updateCategory(
        adminId: number,
        dto: UpdateCategoryDto,
        req: Request
    ) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const updateCategory = await this.categoryRepo.findOne({
            where: { id: dto.id }
        });
        if (!updateCategory) {
            throw new NotFoundException(`Category ID ${dto.id} not found`);
        }

        if (updateCategory.name !== dto.name) {
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '更新名称',
                targetType: '分类',
                targetId: updateCategory.id,
                description: `[${admin.name}] 修改了分类名称：'${updateCategory.name}' -> '${dto.name}' `
            });
        }

        if (updateCategory.imageUrl !== dto.imageUrl) {
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '更新图片',
                targetType: '分类',
                targetId: updateCategory.id,
                description: `[${admin.name}] 修改了分类图片：'${updateCategory.imageUrl}' -> '${dto.imageUrl}'`
            });
        }

        if (updateCategory.description !== dto.description) {
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '更新描述',
                targetType: '分类',
                targetId: updateCategory.id,
                description: `[${admin.name}] 修改了分类描述：'${updateCategory.description}' -> '${dto.description}'`
            });
        }

        if (updateCategory.isActive !== dto.isActive) {
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '更新状态',
                targetType: '分类',
                targetId: updateCategory.id,
                description: `[${admin.name}] 修改了分类状态：'${updateCategory.isActive ? '启用' : '禁用'}' -> '${dto.isActive ? '启用' : '禁用'}'`
            });
        }

        if (updateCategory.displayOrder !== dto.displayOrder) {
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '更新排序',
                targetType: '分类',
                targetId: updateCategory.id,
                description: `[${admin.name}] 修改了分类显示排序：'${updateCategory.displayOrder}' -> '${dto.displayOrder}'`
            });
        }

        if (Number(updateCategory.vatPercent) !== dto.vatPercent) {
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '更新增值税',
                targetType: '分类',
                targetId: updateCategory.id,
                description: `[${admin.name}] 修改了分类增值税：'${updateCategory.vatPercent}' -> '${dto.vatPercent}'`
            });
        }

        if (updateCategory.isCollect !== dto.isCollect) {
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '更新是否收税',
                targetType: '分类',
                targetId: updateCategory.id,
                description: `[${admin.name}] 修改了分类是否收税：'${updateCategory.isCollect ? '是' : '否'}' -> '${dto.isCollect ? '是' : '否'}'`
            });
        }

        await this.categoryRepo.update(dto.id, dto);
        await this.adminService.updateLastLogin(admin.id);
        await this.notiService.sendNotification({
            title: '更新分类',
            content: `${admin.name} 更新了 分类 [ID: ${updateCategory.id}/${updateCategory.name}]`,
            type: NotificationType.CATEGORY,
            path: '/categories',
            createdAt: new Date(),
            userId: admin.id,
            targetId: updateCategory.id,
            userType: UserType.ADMIN,
            enableNoti: 0
        });
    }

    async deleteCategory(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            // Check if category has children
            const childCount = await this.categoryRepo.count({
                where: { parentId: id }
            });

            if (childCount > 0) {
                throw new BadRequestException(
                    'Cannot delete a category that has subcategories'
                );
            }

            const category = await this.categoryRepo.findOneBy({ id });
            if (!category)
                throw new NotFoundException(`Category ID ${id} not found!`);

            category.isActive = false;
            category.isCollect = false;
            await this.categoryRepo.save(category);
            await this.categoryRepo.softDelete(id);
            await this.adminService.updateLastLogin(admin.id);
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '软删除分类',
                targetType: '分类',
                targetId: id,
                description: `[${admin.name}] 软删除了该分类：${category.name}`
            });
            await this.notiService.sendNotification({
                title: '删除分类',
                content: `${admin.name} 删除了 分类 [ID: ${category.id}/${category.name}]`,
                type: NotificationType.CATEGORY,
                path: '/categories',
                createdAt: new Date(),
                userId: admin.id,
                targetId: category.id,
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

    async getCategories(adminId: number) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        await this.adminService.updateLastLogin(admin.id);

        const categories = await this.categoryRepo.find({
            order: { displayOrder: 'ASC' }
        });

        return categories;
    }

    async getDeletedOverviewData() {
        // 总分类数
        const totalDeletedCategories = await this.categoryRepo.count({
            withDeleted: true,
            where: { deletedAt: Not(IsNull()) }
        });

        // 本月新增分类
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const oldCategories = await this.categoryRepo.count({
            withDeleted: true,
            where: {
                deletedAt: Between(startOfMonth, endOfMonth)
            }
        });

        const overview = {
            totalDeletedCategories,
            oldCategories
        };

        return overview;
    }

    async getDeleted(adminId: number, dto: SearchCategoryDto) {
        const admin = await this.adminRepo.findOneBy({ id: adminId });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const query = this.categoryRepo
            .createQueryBuilder('category')
            .withDeleted()
            .leftJoin('category.products', 'product')
            .select([
                'category.id',
                'category.name',
                'category.description',
                'category.isActive',
                'category.displayOrder',
                'category.vatPercent',
                'category.isCollect',
                'category.createdAt',
                'category.deletedAt'
            ])
            .addSelect('COUNT(product.id)', 'productCount')
            .groupBy('category.id');

        if (dto.categoryId)
            query.andWhere('category.id = :categoryId', {
                categoryId: dto.categoryId
            });
        if (dto.name)
            query.andWhere('category.name LIKE :name', {
                name: `%${dto.name}%`
            });
        if (dto.description)
            query.andWhere('category.description LIKE :description', {
                description: `%${dto.description}%`
            });
        if (dto.isActive !== undefined)
            query.andWhere('category.isActive = :isActive', {
                isActive: dto.isActive === 1
            });
        if (dto.isCollect !== undefined)
            query.andWhere('category.isCollect = :isCollect', {
                isCollect: dto.isCollect === 1
            });
        // 金额区间（假设 user.balance 字段为 number）
        if (dto.balanceGreaterThan)
            query.andWhere('category.vatPercent >= :balanceGreaterThan', {
                balanceGreaterThan: parseFloat(dto.balanceGreaterThan)
            });

        if (dto.balanceLessThan)
            query.andWhere('category.vatPercent <= :balanceLessThan', {
                balanceLessThan: parseFloat(dto.balanceLessThan)
            });
        // 时间范围（假设 user.deletedAt
        if (dto.fromDate)
            query.andWhere('category.deletedAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        if (dto.toDate)
            query.andWhere('category.deletedAt <= :toDate', {
                toDate: dto.toDate
            });

        query.andWhere('category.deletedAt IS NOT NULL');

        const sortFieldMap = {
            actions: 'category.id',
            productCount: 'productCount'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `category.${dto.sortBy}`;
        const skip = (dto.page - 1) * dto.limit;
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        const { entities, raw } = await query

            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getRawAndEntities();

        const data = entities.map((cat, i) => ({
            ...cat,
            productCount: parseInt(raw[i]?.productCount ?? '0', 10)
        }));
        const countQuery = query.clone().select('category.id');
        const total = await countQuery.getCount();

        const categories = {
            overview: await this.getDeletedOverviewData(),
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };

        await this.adminService.updateLastLogin(admin.id);

        return categories;
    }

    async restore(adminId: number, id: number, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const admin = await this.adminRepo.findOneBy({ id: adminId });
            if (!admin)
                throw new NotFoundException(`Admin ID ${adminId} not found!`);

            const deleted = await this.categoryRepo.findOne({
                where: { id },
                withDeleted: true
            });
            if (!deleted)
                throw new NotFoundException(
                    `Deleted Category ID ${id} not found!`
                );

            await this.categoryRepo.restore(id);
            await this.adminService.updateLastLogin(admin.id);
            await this.logService.logAdminAction(req, {
                adminId: admin.id,
                userType: UserType.ADMIN,
                action: '恢复分类',
                targetType: '分类',
                targetId: id,
                description: `[${admin.name}] 恢复了该分类：${deleted.name}`
            });
            await this.notiService.sendNotification({
                title: '恢复分类',
                content: `${admin.name} 恢复了 分类 [ID: ${deleted.id}/${deleted.name}]`,
                type: NotificationType.CATEGORY,
                path: '/categories',
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
