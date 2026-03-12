import {
    Controller,
    Post,
    Body,
    Req,
    UseGuards
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('carts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('carts')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post('get-my-carts')
    getItems(@Req() req: Request) {
        const userId = (req as any)?.user.id;
        return this.cartService.getCartItems(req, userId);
    }

    @Post('create-cart')
    add(@Body() dto: CreateCartDto, @Req() req: Request) {
        const userId = (req as any)?.user.id;
        return this.cartService.addToCart(
            userId,
            dto
        );
    }

    @Post('update-cart-quantity')
    update(@Req() req: Request, @Body() dto: UpdateCartDto) {
        const userId = (req as any)?.user.id;
        return this.cartService.updateQuantity(userId, dto);
    }

    @Post('delete-cart')
    delete(@Body('id') cartId: number, @Req() req: Request) {
        const userId = (req as any)?.user.id;
        return this.cartService.delete(userId, cartId);
    }

    @Post('delete-all')
    clear(@Req() req: Request) {
        const userId = (req as any)?.user.id;
        return this.cartService.clearCart(userId);
    }

    @Post('buy-again')
    buyAgain(@Req() req: Request, @Body() body: any) {
        const userId = (req as any)?.user.id;
        const orderId = body?.orderId;
        return this.cartService.buyAgain(userId, orderId);
    }
}
