import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { Request } from 'express';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentStatus } from './enums/order.enum';
import { SearchOrderDto } from './dto/search-order.dto';
import { UpdateOrderPaymentProofDto } from './dto/update-order-payment-proof.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly orderService: OrdersService) {}

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('create-one')
    @ApiOperation({
        summary: 'Create a new order',
        description:
            'Create a new product order. Only customers can place orders.'
    })
    @ApiBody({
        description: 'Order details',
        type: CreateOrderDto
    })
    @ApiCreatedResponse({
        description: 'Order created successfully',
        type: Order
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data or insufficient balance'
    })
    @ApiForbiddenResponse({
        description: 'User does not have permission to perform this action'
    })
    async create(
        @Req() req: Request,
        @Body() createOrderDto: CreateOrderDto
    ): Promise<Order> {
        const userId = (req as any)?.user?.id;
        return this.orderService.createOrder(userId, createOrderDto, req);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('update-status')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update order status',
        description:
            'Update the status of an order. Only admins and the restaurant that owns the order can update the status.'
    })
    @ApiParam({
        name: 'id',
        description: 'Order ID',
        type: Number,
        example: 1
    })
    @ApiBody({
        description: 'New status and optional reason',
        type: UpdateOrderStatusDto
    })
    @ApiOkResponse({
        description: 'Order status updated',
        type: Order
    })
    @ApiNotFoundResponse({
        description: 'Order not found'
    })
    @ApiForbiddenResponse({
        description: 'Not authorized to update this order'
    })
    @ApiBadRequestResponse({
        description: 'Invalid status transition or insufficient balance'
    })
    async updateStatus(
        @Req() req: Request,
        @Body() dto: UpdateOrderStatusDto
    ): Promise<{ status: OrderStatus; paymentStatus: PaymentStatus }> {
        return this.orderService.updateOrderStatus(req, dto);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('get-my-orders')
    @ApiOperation({
        summary: 'Get user orders',
        description: 'Get a list of orders for the authenticated user.'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: OrderStatus,
        description: 'Filter orders by status'
    })
    @ApiOkResponse({
        description: 'Returns list of orders',
        type: [Order]
    })
    async findMyOrders(
        @Req() req: Request,
        @Body() dto: SearchOrderDto
    ) {
        const userId = (req as any)?.user.id;
        return this.orderService.findMyOrders(userId, dto);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('delete-order')
    async deleteOrder(@Req() req: Request, @Body() body: any) {
        const orderId = body?.orderId;
        return await this.orderService.deleteOrder(orderId, req);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('get-one-order')
    getOneOrder(@Req() req: Request, @Body('id') id: number) {
        const userId = (req as any)?.user.id;
        return this.orderService.getOrderById(id, userId);
    }

    @Post('get-pay-order')
    getPayOrder(@Body('id') id: string) {
        return this.orderService.getPayOrder(id);
    }

    @Post('update-pay-order')
    updatePayOrder(@Req() req: Request, @Body() dto: UpdateOrderStatusDto) {
        return this.orderService.updateOrderStatus(req, dto);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('update-order')
    updateOrder(
        @Req() req: Request,
        @Body('orderId') orderId: number,
        @Body('image') image: string
    ) {
        return this.orderService.updateOrder(orderId, image, req);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('update-payment-proof')
    @HttpCode(HttpStatus.OK)
    updatePaymentProof(
        @Req() req: Request,
        @Body() body: UpdateOrderPaymentProofDto
    ) {
        const userId = (req as any)?.user?.id;
        return this.orderService.updateOrderPaymentProof(
            userId,
            body.orderId,
            body.paymentProofImage,
            req
        );
    }
}
