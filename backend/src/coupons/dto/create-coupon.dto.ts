import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsDateString, IsBoolean, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { CouponDiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({ description: 'Name of the coupon' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique coupon code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Type of discount (percentage or fixed)',
    enum: CouponDiscountType,
    default: CouponDiscountType.PERCENTAGE,
  })
  @IsEnum(CouponDiscountType)
  @IsOptional()
  discount_type?: CouponDiscountType;

  @ApiProperty({ description: 'Value of the discount' })
  @IsNumber()
  @Min(0)
  discount_value: number;

  @ApiProperty({ 
    description: 'Maximum number of times this coupon can be used (0 for unlimited)',
    default: 0 
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  usage_limit?: number;

  @ApiProperty({ 
    description: 'Date and time when the coupon becomes valid (ISO string)',
    example: '2023-01-01T00:00:00.000Z' 
  })
  @IsDateString()
  valid_from: string;

  @ApiProperty({ 
    description: 'Date and time when the coupon expires (ISO string)',
    example: '2023-12-31T23:59:59.999Z' 
  })
  @IsDateString()
  valid_to: string;

  @ApiProperty({ 
    description: 'Whether the coupon is active',
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
