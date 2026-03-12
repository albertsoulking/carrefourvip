import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Column } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entity/products.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.favorites, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Product, product => product.favorites, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
