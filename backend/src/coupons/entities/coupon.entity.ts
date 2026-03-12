import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum CouponDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('coupons')
export class Coupon {
  @ApiProperty({ description: 'The unique identifier of the coupon' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the coupon' })
  @Column({ type: 'text' })
  name: string;

  @ApiProperty({ description: 'Unique coupon code' })
  @Column({ type: 'text', unique: true })
  code: string;

  @ApiProperty({
    description: 'Type of discount (percentage or fixed)',
    enum: CouponDiscountType,
  })
  @Column({
    type: 'simple-enum',
    enum: CouponDiscountType,
    default: CouponDiscountType.PERCENTAGE,
  })
  discount_type: CouponDiscountType;

  @ApiProperty({ description: 'Value of the discount' })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discount_value: number;

  @ApiProperty({ description: 'Maximum number of times this coupon can be used', default: 0 })
  @Column({ type: 'int', default: 0 })
  usage_limit: number;

  @ApiProperty({ description: 'Number of times this coupon has been used', default: 0 })
  @Column({ type: 'int', default: 0 })
  used_count: number;

  @ApiProperty({ description: 'Date and time when the coupon becomes valid', type: 'string', format: 'date-time' })
  @Column()
  valid_from: Date;

  @ApiProperty({ description: 'Date and time when the coupon expires', type: 'string', format: 'date-time' })
  @Column()
  valid_to: Date;

  @ApiProperty({ description: 'Whether the coupon is active', default: true })
  @Column({ type: 'boolean', default: true })
  status: boolean;

  @ApiProperty({ description: 'Date when the coupon was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the coupon was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper method to check if the coupon is currently valid
  isValid(): boolean {
    const now = new Date();
    return (
      this.status &&
      this.used_count < this.usage_limit &&
      now >= this.valid_from &&
      now <= this.valid_to
    );
  }

  // Method to apply the coupon to a total amount
  applyDiscount(amount: number): number {
    if (!this.isValid()) {
      return amount;
    }

    if (this.discount_type === CouponDiscountType.PERCENTAGE) {
      return amount * (1 - this.discount_value / 100);
    } else {
      return Math.max(0, amount - this.discount_value);
    }
  }

  // Method to mark the coupon as used
  markAsUsed(): void {
    this.used_count += 1;
    if (this.usage_limit > 0 && this.used_count >= this.usage_limit) {
      this.status = false;
    }
  }
}
