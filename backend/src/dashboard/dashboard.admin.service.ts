import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/admin/entities/admin.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderStatus, PaymentStatus } from 'src/orders/enums/order.enum';
import { RoleType } from 'src/role/enum/role.enum';
import { User } from 'src/users/entities/user.entity';
import { UserMode } from 'src/users/enum/user.enum';
import { In, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class AdminDashboardService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepo: Repository<OrderItem>,
        private readonly adminService: AdminService
    ) {}

    async getDashboardOverview(adminId: number) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });
        if (!admin) {
            throw new NotFoundException(`Admin ID ${adminId} Invalid!`);
        }

        const now = new Date();
        const startDate = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
        );
        const endDate = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth() + 1,
                0,
                23,
                59,
                59,
                999
            )
        );

        // 本月收入 & 应付余额
        const priceStats = await (
            await this.applyUserScope(
                this.orderRepo
                    .createQueryBuilder('order')
                    .select([
                        `COALESCE(SUM(CASE WHEN order.paymentStatus = '${PaymentStatus.PAID}' THEN CAST(order.payAmount AS DECIMAL(10,2)) ELSE 0 END), 0) AS totalRevenue`,
                        `COALESCE(SUM(CASE WHEN order.paymentStatus = '${PaymentStatus.PENDING}' THEN CAST(order.payAmount AS DECIMAL(10,2)) ELSE 0 END), 0) AS balance`
                    ])
                    .where('order.createdAt BETWEEN :start AND :end', {
                        start: startDate,
                        end: endDate
                    }),
                admin
            )
        ).getRawOne();

        // 本月订单状态统计 (Pie Chart)
        const orderCounts = await (
            await this.applyUserScope(
                this.orderRepo
                    .createQueryBuilder('order')
                    .select([
                        `COUNT(CASE WHEN order.status = '${OrderStatus.DELIVERED}' THEN 1 END) AS completedOrders`,
                        `COUNT(CASE WHEN order.status IN ('${OrderStatus.PROCESSING}', '${OrderStatus.SHIPPED}') THEN 1 END) AS processingOrders`,
                        `COUNT(CASE WHEN order.status = '${OrderStatus.CANCELLED}' THEN 1 END) AS cancelledOrders`
                    ])
                    .where('order.createdAt BETWEEN :start AND :end', {
                        start: startDate,
                        end: endDate
                    }),
                admin
            )
        ).getRawOne();

        // 正式用户国家分布统计 (Pie Chart)
        const userCountryDistributionRaw = await (
            await this.applyUserScope(
                this.userRepo
                    .createQueryBuilder('user')
                    .select('user.country', 'country')
                    .addSelect('COUNT(*)', 'count')
                    .where('user.mode = :mode', { mode: UserMode.LIVE }),
                admin
            )
        )
            .groupBy('user.country')
            .orderBy('count', 'DESC')
            .getRawMany();

        const userCountryDistribution = userCountryDistributionRaw.map(
            (item) => ({
                name: item.country || '无',
                value: Number(item.count)
            })
        );

        // 本月新增用户 (Bar Chart)
        const newCustomerCount = await (
            await this.applyUserScope(
                this.userRepo
                    .createQueryBuilder('user')
                    .where('user.createdAt BETWEEN :start AND :end', {
                        start: startDate.toISOString(),
                        end: endDate.toISOString()
                    })
                    .andWhere('user.mode = :mode', { mode: UserMode.LIVE }),
                admin
            )
        ).getCount();

        // ✅ 每日收入统计（Line Chart）
        const dailyRevenueRaw = await (
            await this.applyUserScope(
                this.orderRepo
                    .createQueryBuilder('order')
                    .select("DATE_FORMAT(order.createdAt, '%Y-%m-%d')", 'date') // ✅ 推荐
                    .addSelect('SUM(order.payAmount)', 'amount')
                    .where('order.createdAt BETWEEN :start AND :end', {
                        start: startDate,
                        end: endDate
                    })
                    .andWhere(`order.paymentStatus = '${PaymentStatus.PAID}'`),
                admin
            )
        )
            .groupBy('date')
            .orderBy('date', 'ASC')
            .getRawMany();

        // 构建完整的日期列表（防止某天没数据）
        const dailyRevenue: { date: string; amount: number }[] = [];
        for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
        ) {
            const dateStr = d.toISOString().slice(0, 10);
            const dayOnly = d.getDate().toString();
            const found = dailyRevenueRaw.find((r) => r.date === dateStr);
            dailyRevenue.push({
                date: dayOnly,
                amount: found ? parseFloat(found.amount) : 0
            });
        }

        // ✅ 最近订单（5条）
        const recentOrders = await this.orderRepo.find({
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['user', 'user.parent'], // 如果你有 user 关联
            select: {
                id: true,
                totalPrice: true,
                status: true,
                paymentStatus: true,
                createdAt: true,
                imageUrl: true,
                quantity: true,
                subtotal: true,
                payAmount: true,
                payMethod: true,
                paidAt: true,
                deliveryMethod: true,
                user: {
                    id: true,
                    name: true,
                    email: true,
                    mode: true,
                    parent: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // 每日新增用户数（本月）
        const userGrowthRaw = await (
            await this.applyUserScope(
                this.userRepo
                    .createQueryBuilder('user')
                    .select('DATE(user.createdAt)', 'date')
                    .addSelect('COUNT(*)', 'count')
                    .where('user.createdAt BETWEEN :start AND :end', {
                        start: startDate.toISOString(),
                        end: endDate.toISOString()
                    })
                    .andWhere('user.mode = :mode', { mode: UserMode.LIVE }),
                admin
            )
        )
            .groupBy('date')
            .orderBy('date', 'ASC')
            .getRawMany();

        // 映射成 Map，方便快速匹配
        const userGrowthMap = new Map(
            userGrowthRaw.map((u) => [
                (u.date instanceof Date
                    ? u.date.toLocaleString('en-CA', {
                          timeZone: 'Asia/Shanghai',
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                      })
                    : u.date
                ).slice(0, 10),
                parseInt(u.count, 10)
            ])
        );

        const userDailyGrowth: { date: string; count: number }[] = [];
        for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
        ) {
            const dateStr = d.toISOString().slice(0, 10);
            const dayOnly = d.getDate().toString();

            userDailyGrowth.push({
                date: dayOnly,
                count: userGrowthMap.get(dateStr) || 0
            });
        }

        // 补充热销商品排行 Top 5（基于 order_items 表）
        const topProductsRaw = await (
            await this.applyUserScope(
                this.orderItemRepo
                    .createQueryBuilder('item')
                    .leftJoin('item.order', 'order')
                    .select('item.productName', 'name')
                    .addSelect('MAX(item.productImage)', 'image')
                    .addSelect('SUM(item.quantity)', 'sales')
                    .where('order.createdAt BETWEEN :start AND :end', {
                        start: startDate,
                        end: endDate
                    })
                    .andWhere('order.paymentStatus = :status', {
                        status: PaymentStatus.PAID
                    }),
                admin
            )
        )
            .groupBy('item.productName')
            .orderBy('sales', 'DESC')
            .limit(5)
            .getRawMany();

        const topProducts = topProductsRaw.map((row) => ({
            name: row.name,
            image: row.image,
            sales: parseInt(row.sales, 10)
        }));

        await this.adminService.updateLastLogin(admin.id);

        return {
            ...priceStats, // totalRevenue, balance
            ...orderCounts, // completedOrders, processingOrders, cancelledOrders
            countryDistribution: userCountryDistribution, // 饼图
            newCustomers: newCustomerCount,
            revenueDaily: dailyRevenue, // 折线图
            userDailyGrowth, // 折线图（每日新增用户）
            topProducts, // Top5 热销商品
            recentOrders // 最新5条订单
        };
    }

    async applyUserScope<T extends SelectQueryBuilder<any>>(
        query: T,
        admin: Admin
    ): Promise<T> {
        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((t) => t.id);
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: In(headIds) },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((t) => t.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0');
            }
        }

        if (admin.role.name === RoleType.TEAM) {
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            const userIds = users.map((u) => u.id);
            if (userIds.length > 0) {
                query.andWhere('user.id IN (:...userIds)', { userIds });
            } else {
                query.andWhere('1 = 0');
            }
        }

        // RoleType.ADMIN 不做限制
        return query;
    }
}
