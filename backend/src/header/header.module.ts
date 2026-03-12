import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderService } from './header.service';
import { HeaderController } from './header.controller';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Favorite } from 'src/favorites/entity/favorites.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Cart } from 'src/cart/entity/cart.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Ticket, Favorite, Order, Cart, User])],
    providers: [HeaderService],
    controllers: [HeaderController],
    exports: [HeaderService]
})
export class HeaderModule {}
