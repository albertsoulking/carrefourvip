import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from 'src/role/enum/role.enum';

@ApiTags('coupons')
@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ status: 201, description: 'The coupon has been successfully created.', type: Coupon })
  @ApiResponse({ status: 400, description: 'Invalid input or coupon code already exists' })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter active coupons only' })
  @ApiResponse({ status: 200, description: 'Return all coupons.', type: [Coupon] })
  findAll(@Query('active') active?: boolean) {
    return this.couponsService.findAll(active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a coupon by ID' })
  @ApiResponse({ status: 200, description: 'Return the coupon.', type: Coupon })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a coupon by code' })
  @ApiResponse({ status: 200, description: 'Return the coupon.', type: Coupon })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  findOneByCode(@Param('code') code: string) {
    return this.couponsService.findOneByCode(code);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update a coupon' })
  @ApiResponse({ status: 200, description: 'The coupon has been successfully updated.', type: Coupon })
  @ApiResponse({ status: 400, description: 'Invalid input or coupon code already exists' })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete a coupon' })
  @ApiResponse({ status: 200, description: 'The coupon has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate a coupon' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns validation result and message if invalid',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        message: { type: 'string', nullable: true }
      }
    }
  })
  async validate(@Param('code') code: string) {
    return this.couponsService.validateCoupon(code);
  }

  @Post('apply/:code')
  @ApiOperation({ summary: 'Apply a coupon to an amount' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the original amount, discounted amount, and discount',
    schema: {
      type: 'object',
      properties: {
        originalAmount: { type: 'number' },
        discountedAmount: { type: 'number' },
        discount: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid coupon or validation failed' })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  apply(
    @Param('code') code: string,
    @Query('amount') amount: number
  ) {
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    return this.couponsService.applyCoupon(code, amount);
  }
}
