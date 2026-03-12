import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entity/products.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.carts, { eager: true, createForeignKeyConstraints: false })
  user: User;

  @ManyToOne(() => Product, (product) => product.carts, { eager: true, createForeignKeyConstraints: false })
  product: Product;

  @Column({ type: 'text', nullable: true})
  imageUrl: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  attributes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  attrPrice: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
