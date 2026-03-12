import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entity/products.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Order } from 'src/orders/entities/order.entity';
import { UsersService } from 'src/users/users.service';
import { IpService } from 'src/ip/ip.service';
import { ExchangeRate } from 'src/exchange/entity/exchange.entity';
import { Request } from 'express';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepo: Repository<Cart>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(ExchangeRate)
        private readonly exchangeRepo: Repository<ExchangeRate>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly userService: UsersService,
        private readonly ipService: IpService,
        private readonly notiService: NotificationService
    ) {}

    async getCartItems(req: Request, userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException('Invalid Token!');

        await this.userService.updateLastLogin(userId);

        const query = await this.cartRepo
            .createQueryBuilder('cart')
            .leftJoin('cart.product', 'product')
            .leftJoin('product.category', 'category')
            .leftJoin('cart.user', 'user')
            .addSelect([
                'cart.id',
                'cart.quantity',
                'product.id',
                'product.name',
                'product.price',
                'product.imageUrl',
                'category.id',
                'category.vatPercent',
                'category.isCollect',
                'user.id',
                'user.name',
                'user.email'
            ])
            .where('cart.userId = :userId', { userId })
            .getMany();

        const geoInfo = await this.ipService.getGeoInfoByIp(req);
        const exRate = await this.exchangeRepo.findOneBy({
            fromCurrency: 'EUR',
            toCurrency: geoInfo?.currency ?? 'EUR'
        });

        const rawData = await Promise.all(
            query.map(async (cart) => {
                let convertedPrices = Number(cart.product.price);
                if (exRate) {
                    convertedPrices *= Number(exRate.rate);
                }

                return {
                    ...cart
                    // convertedPrices
                };
            })
        );

        return rawData;
    }

    async addToCart(userId: number, dto: CreateCartDto) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException('Invalid Token!');

        const product = await this.productRepo.findOne({
            where: { id: dto.productId }
        });
        if (!product) throw new NotFoundException('Product Not Found!');

        let cart = await this.cartRepo.findOne({
            where: {
                user: { id: userId },
                product: { id: dto.productId }
            }
        });

        if (cart) {
            cart.quantity = Math.min(99, cart.quantity + dto.quantity);
            cart.totalPrice = String(
                Number(cart.quantity) * Number(cart.unitPrice)
            );
            await this.cartRepo.save(cart);
        } else {
            cart = this.cartRepo.create({
                ...dto,
                user: { id: userId },
                product: { id: product.id }
            });

            cart = await this.cartRepo.save(cart);
        }

        await this.userService.updateLastLogin(userId);
        await this.notiService.sendNotification({
            title: 'Added to Cart',
            userId,
            content: `[ID: ${userId}/${user.name}] added to cart: ${dto.quantity} x ${product.name}`,
            type: NotificationType.CART,
            path: '/',
            createdAt: new Date(),
            targetId: cart.id,
            userType: UserType.USER,
            enableNoti: 0
        });
    }

    async updateQuantity(userId: number, dto: UpdateCartDto) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException('Invalid Token!');

        const cart = await this.cartRepo.findOne({
            where: { id: dto.id }
        });
        if (!cart) throw new NotFoundException('No Cart Item!');

        cart.quantity = dto.quantity;
        cart.totalPrice = String(
            Number(cart.quantity) * Number(cart.unitPrice)
        );

        await this.cartRepo.save(cart);
        await this.userService.updateLastLogin(userId);
    }

    async delete(userId: number, cartId: number) {
        const cart = await this.cartRepo.findOne({
            where: { id: cartId },
            relations: ['product', 'user']
        });
        if (!cart) throw new NotFoundException('Cart Not Found!');

        await this.notiService.sendNotification({
            title: 'Removed from Cart',
            userId,
            content: `[ID: ${userId}/${cart.user.name}] removed from cart: ${cart.product.name}`,
            type: NotificationType.CART,
            path: '/',
            createdAt: new Date(),
            targetId: cart.id,
            userType: UserType.USER,
            enableNoti: 0
        });
        await this.cartRepo.remove(cart);
        await this.userService.updateLastLogin(userId);
    }

    async clearCart(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException('Invalid Token!');

        await this.cartRepo.delete({ user: { id: userId } });
        await this.userService.updateLastLogin(userId);
    }

    async buyAgain(userId: number, orderId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });
        if (!user) throw new NotFoundException('Invalid Token!');

        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['items', 'items.product']
        });
        if (!order) throw new NotFoundException('Order not found');

        for (const item of order.items) {
            const existing = await this.cartRepo.findOne({
                where: {
                    user: { id: userId },
                    product: { id: item.product.id }
                }
            });

            if (existing) {
                existing.quantity = Math.min(
                    99,
                    existing.quantity + item.quantity
                );
                existing.totalPrice = String(
                    existing.quantity * Number(item.unitPrice)
                );
                await this.cartRepo.save(existing);
            } else {
                const cartItem = this.cartRepo.create({
                    ...item,
                    user: { id: userId },
                    product: { id: item.product.id }
                });
                await this.cartRepo.save(cartItem);
            }
            await this.notiService.sendNotification({
                title: 'Added to Cart',
                userId,
                content: `[ID: ${userId}/${user.name}] added to cart: ${item.quantity} x ${item.productName}`,
                type: NotificationType.CART,
                path: '/',
                createdAt: new Date(),
                targetId: item.id,
                userType: UserType.USER,
                enableNoti: 0
            });
        }

        await this.userService.updateLastLogin(userId);
    }
}
