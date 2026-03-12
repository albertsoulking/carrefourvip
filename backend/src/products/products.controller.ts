import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './products.service';
import { Product } from './entity/products.entity';
import { SearchProductDto } from './dto/search-product.dto';
import { Request } from 'express';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productService: ProductService) {}

    @Post('get-all-products')
    async searchProducts(@Req() req: Request, @Body() dto: SearchProductDto) {
        return this.productService.findAllProducts(req, dto);
    }

    @Post('get-product')
    getProduct(@Body('id') id: number, @Body('userId') userId: number) {
        return this.productService.findOneProduct(id, userId);
    }
}
