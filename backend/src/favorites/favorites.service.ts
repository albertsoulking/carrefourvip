import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entity/favorites.entity';
import { Repository } from 'typeorm';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UsersService } from 'src/users/users.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

@Injectable()
export class FavoriteService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepo: Repository<Favorite>,
        private readonly userService: UsersService,
        private readonly notiService: NotificationService
    ) {}

    async addToFavorites(userId: number, createFavoriteDto: CreateFavoriteDto) {
        const already = await this.favoriteRepo.findOne({
            where: {
                user: { id: userId },
                product: { id: createFavoriteDto.productId }
            }
        });

        if (already)
            throw new InternalServerErrorException('Already favorited');

        let favorite = this.favoriteRepo.create({
            user: { id: userId },
            product: { id: createFavoriteDto.productId }
        });

        favorite = await this.favoriteRepo.save(favorite);
        await this.userService.updateLastLogin(userId);
        await this.notiService.sendNotification({
            title: 'New Favorite Added',
            content: `User ID ${userId} added product ID ${createFavoriteDto.productId} to favorites.`,
            type: NotificationType.FAVORITE,
            userId,
            path: '/favorites',
            createdAt: new Date(),
            targetId: favorite.id,
            userType: UserType.USER,
            enableNoti: 0
        });

        return favorite;
    }

    async findFavorites(userId: number) {
        await this.userService.updateLastLogin(userId);

        return this.favoriteRepo.find({
            where: { user: { id: userId } },
            relations: ['product']
        });
    }

    async removeFavorite(userId: number, productId: number) {
        const favorite = await this.favoriteRepo.findOne({
            where: { user: { id: userId }, product: { id: productId } },
            relations: ['product']
        });
        if (!favorite)
            throw new InternalServerErrorException('Favorite not found');

        await this.userService.updateLastLogin(userId);
        await this.notiService.sendNotification({
            title: 'Favorite Removed',
            content: `User ID ${userId} removed product ID ${productId} from favorites.`,
            type: NotificationType.FAVORITE,
            userId,
            path: '/favorites',
            createdAt: new Date(),
            targetId: favorite.id,
            userType: UserType.USER,
            enableNoti: 0
        });
        
        return this.favoriteRepo.delete(favorite.id);
    }

    async findMyFavorites(
        userId: number,
        page: number,
        limit: number
    ): Promise<{
        data: Favorite[];
        total: number;
        page: number;
        lastPage: number;
    }> {
        const skip = (page - 1) * limit;

        const query = this.favoriteRepo
            .createQueryBuilder('favorite')
            .where('favorite.userId = :userId', { userId })
            .leftJoinAndSelect('favorite.product', 'product')
            .leftJoinAndSelect('product.category', 'category');

        await this.userService.updateLastLogin(userId);

        const [data, total] = await query
            .skip(skip)
            .take(limit)
            .orderBy('favorite.id', 'DESC')
            .getManyAndCount();

        const favorites = {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit)
        };

        return favorites;
    }
}
