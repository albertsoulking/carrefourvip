import {
    Body,
    Controller,
    HttpStatus,
    Post,
    Req,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entity/products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminProductsService } from './prodcuts.admin.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Request } from 'express';
import { SearchProductDto } from './dto/search-product.dto';

@ApiTags('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('admin/products')
export class AdminProductsController {
    constructor(private readonly adminProductsService: AdminProductsService) {}

    @Post('get-all-products')
    @ApiOperation({ summary: 'Get all product items with optional filters' })
    getAll(@Req() req: Request, @Body() dto: SearchProductDto) {
        const adminId = (req as any)?.user.id;
        return this.adminProductsService.getAll(adminId, dto);
    }

    @Post('update-product')
    @ApiOperation({ summary: 'Update one product item with optional data' })
    update(@Req() req: Request, @Body() body: UpdateProductDto) {
        const adminId = (req as any)?.user.id;
        return this.adminProductsService.update(adminId, body, req);
    }

    @Post('create-product')
    @ApiOperation({ summary: 'Create a new food item (restaurant users only)' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Food item created successfully',
        type: Product
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or not a restaurant user'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User not authenticated'
    })
    create(@Req() req: Request, @Body() createProductDto: CreateProductDto) {
        const adminId = (req as any)?.user.id;
        return this.adminProductsService.create(adminId, createProductDto, req);
    }

    @Post('delete-product')
    @ApiOperation({ summary: 'Delete a food item' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Food item deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Food item not found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'No permission to delete'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User not authenticated'
    })
    delete(@Req() req: Request, @Body() body?: any) {
        const id = body?.id;
        const adminId = (req as any)?.user.id;

        return this.adminProductsService.delete(adminId, +id, req);
    }

    @Post('get-deleted-products')
    getDeletedProducts(@Req() req: Request, @Body() dto: SearchProductDto) {
        const adminId = (req as any)?.user.id;
        return this.adminProductsService.getDeleted(adminId, dto);
    }

    @Post('restore-product')
    restore(@Req() req: Request, @Body('id') id: number) {
        const adminId = (req as any)?.user.id;
        return this.adminProductsService.restore(adminId, id, req);
    }
}
