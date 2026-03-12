import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entity/favorites.entity';
import { AdminFavoriteController } from './favorites.admin.controller';
import { FavoriteController } from './favorites.controller';
import { FavoriteService } from './favorites.service';
import { AdminFavoriteService } from './favorites.admin.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Favorite]),
        UsersModule,
        NotificationModule
    ],
    controllers: [FavoriteController, AdminFavoriteController],
    providers: [FavoriteService, AdminFavoriteService],
    exports: [FavoriteService, AdminFavoriteService]
})
export class FavoriteModule {}
