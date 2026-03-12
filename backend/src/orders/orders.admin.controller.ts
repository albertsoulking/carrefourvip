import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Order } from './entities/order.entity';
import { AdminOrderService } from './orders.admin.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Request } from 'express';
import { SearchOrderDto } from './dto/search-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminCreateOrderDto } from './dto/admin-create-order.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/orders')
@Controller('admin/orders')
export class AdminOrderController {
    constructor(private readonly adminOrderService: AdminOrderService) {}

    @Post('get-all-orders')
    getAllOrders(@Req() req: Request, @Body() dto: SearchOrderDto) {
        const adminId = (req as any)?.user.id;
        return this.adminOrderService.getAllOrders(adminId, dto);
    }

    @Post('get-one-order')
    getOneOrder(@Body('id') id: number): Promise<Order> {
        return this.adminOrderService.getOrderById(+id);
    }

    @Post('update-order')
    updateOrder(
        @Req() req: Request,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto
    ) {
        const adminId = (req as any)?.user.id;
        return this.adminOrderService.updateOrder(
            updateOrderStatusDto,
            adminId,
            req
        );
    }

    @Post('get-deleted-orders')
    getDeleted(@Req() req: Request, @Body() dto: SearchOrderDto) {
        const adminId = (req as any)?.user.id;
        return this.adminOrderService.getDeleted(adminId, dto);
    }

    @Post('delete-order')
    delete(@Req() req: Request, @Body('id') id: number) {
        const adminId = (req as any)?.user.id;
        return this.adminOrderService.delete(adminId, id, req);
    }

    @Post('create-order')
    create(@Req() req: Request, @Body() dto: AdminCreateOrderDto) {
        const adminId = (req as any)?.user.id;
        return this.adminOrderService.create(dto, adminId, req);
    }
}
