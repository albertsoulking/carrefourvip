import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entity/cart.entity';
import { Favorite } from 'src/favorites/entity/favorites.entity';
import { Order } from 'src/orders/entities/order.entity';
import { PaymentStatus } from 'src/orders/enums/order.enum';
import { RoleType } from 'src/role/enum/role.enum';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HeaderService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Ticket)
        private readonly ticketRepo: Repository<Ticket>,
        @InjectRepository(Favorite)
        private readonly favoriteRepo: Repository<Favorite>,
        @InjectRepository(Cart)
        private readonly cartRepo: Repository<Cart>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>
    ) {}

    async getHeaderStatus(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException(`User ID ${userId} not found!`);

        // 获取未读客户消息
        const { totalUnread } = await this.ticketRepo
            .createQueryBuilder('ticket')
            .leftJoin('ticket.user', 'user')
            .leftJoin('ticket.messages', 'message')
            .leftJoin('message.senderRole', 'role')
            .where('user.id = :userId', { userId })
            .andWhere('message.isRead = 0')
            .andWhere('role.name != :role', { role: RoleType.CUSTOMER })
            .select('COUNT(message.id)', 'totalUnread')
            .getRawOne();

        // 获取收藏数量
        const totalFavorite = await this.favoriteRepo.count({
            where: { user: { id: userId } }
        });

        // 获取购物车数量
        const totalCart = await this.cartRepo.count({
            where: { user: { id: userId } }
        });

        // 获取未支付订单数量
        const totalUnpaid = await this.orderRepo.count({
            where: {
                user: { id: userId },
                paymentStatus: PaymentStatus.PENDING
            }
        });

        const total = {
            totalUnread,
            totalFavorite,
            totalCart,
            totalUnpaid
        };

        return total;
    }
}
