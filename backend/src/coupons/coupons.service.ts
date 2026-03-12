import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual, And } from 'typeorm';
import { Coupon, CouponDiscountType } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    // Check if code already exists
    const existingCoupon = await this.couponRepository.findOne({ 
      where: { code: createCouponDto.code } 
    });
    
    if (existingCoupon) {
      throw new BadRequestException('Coupon code already exists');
    }

    const coupon = new Coupon();
    Object.assign(coupon, createCouponDto);
    coupon.valid_from = new Date(createCouponDto.valid_from);
    coupon.valid_to = new Date(createCouponDto.valid_to);
    
    // Set default values if not provided
    if (createCouponDto.discount_type === undefined) {
      coupon.discount_type = CouponDiscountType.PERCENTAGE;
    }
    
    if (createCouponDto.status === undefined) {
      coupon.status = true;
    }

    return this.couponRepository.save(coupon);
  }

  async findAll(activeOnly: boolean = false): Promise<Coupon[]> {
    const where: FindOptionsWhere<Coupon> = {};
    
    if (activeOnly) {
      const now = new Date();
      where.status = true;
      where.valid_from = LessThanOrEqual(now);
      where.valid_to = MoreThanOrEqual(now);
      where.usage_limit = MoreThanOrEqual(0);
    }
    
    return this.couponRepository.find({ where });
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async findOneByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);
    
    // Check if updating code and it's being used by another coupon
    if (updateCouponDto.code && updateCouponDto.code !== coupon.code) {
      const existingCoupon = await this.couponRepository.findOne({ 
        where: { code: updateCouponDto.code } 
      });
      
      if (existingCoupon) {
        throw new BadRequestException('Coupon code already exists');
      }
    }

    Object.assign(coupon, updateCouponDto);
    
    // Convert string dates to Date objects if they exist
    if (updateCouponDto.valid_from) {
      coupon.valid_from = new Date(updateCouponDto.valid_from);
    }
    
    if (updateCouponDto.valid_to) {
      coupon.valid_to = new Date(updateCouponDto.valid_to);
    }

    return this.couponRepository.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const result = await this.couponRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
  }

  async validateCoupon(code: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const coupon = await this.findOneByCode(code);
      const now = new Date();
      
      if (!coupon.status) {
        return { valid: false, message: 'Coupon is not active' };
      }
      
      if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, message: 'Coupon usage limit exceeded' };
      }
      
      if (now < coupon.valid_from) {
        return { valid: false, message: 'Coupon is not yet valid' };
      }
      
      if (now > coupon.valid_to) {
        return { valid: false, message: 'Coupon has expired' };
      }
      
      return { valid: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { valid: false, message: 'Invalid coupon code' };
      }
      throw error;
    }
  }

  async applyCoupon(code: string, amount: number): Promise<{ originalAmount: number; discountedAmount: number; discount: number }> {
    const coupon = await this.findOneByCode(code);
    const validation = await this.validateCoupon(code);
    
    if (!validation.valid) {
      throw new BadRequestException(validation.message || 'Invalid coupon');
    }
    
    const discountedAmount = coupon.applyDiscount(amount);
    const discount = amount - discountedAmount;
    
    return {
      originalAmount: amount,
      discountedAmount,
      discount
    };
  }

  async markCouponAsUsed(code: string): Promise<void> {
    const coupon = await this.findOneByCode(code);
    
    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      throw new BadRequestException('Coupon usage limit exceeded');
    }
    
    coupon.markAsUsed();
    await this.couponRepository.save(coupon);
  }
}
