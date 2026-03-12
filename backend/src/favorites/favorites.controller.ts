import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards
} from '@nestjs/common';
import { FavoriteService } from './favorites.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('favorites')
export class FavoriteController {
    constructor(private readonly favoriteService: FavoriteService) {}

    @Post('create-favorite')
    createOne(@Req() req: Request, @Body() createFavorite: CreateFavoriteDto) {
        const userId = (req as any)?.user.id;
        return this.favoriteService.addToFavorites(userId, createFavorite);
    }

    @Post('get-all-favorites')
    getAll(@Req() req: Request) {
        const userId = (req as any)?.user.id;
        return this.favoriteService.findFavorites(userId);
    }

    @Post('delete-favorite')
    deleteOne(@Req() req: Request, @Body() body: any) {
        const userId = (req as any)?.user.id;
        const productId = body?.productId;
        return this.favoriteService.removeFavorite(userId, productId);
    }

    @Post('get-my-favorites')
    getMyFavorites(
        @Req() req: Request,
        @Body('page') page: number,
        @Body('limit') limit: number
    ) {
        const userId = (req as any)?.user.id;
        return this.favoriteService.findMyFavorites(userId, page, limit);
    }
}
