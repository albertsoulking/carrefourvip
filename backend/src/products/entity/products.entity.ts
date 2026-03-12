import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    DeleteDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';
import { Favorite } from 'src/favorites/entity/favorites.entity';
import { Cart } from 'src/cart/entity/cart.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';

@Entity('products')
export class Product {
    @ApiProperty({
        description: 'Unique identifier for the food item',
        example: 1,
        type: Number
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'Name of the food item',
        example: 'Chicken Burger'
    })
    @Column({ type: 'text' })
    name: string;

    @ApiProperty({
        description: 'Description of the food item',
        example: 'Juicy chicken patty with lettuce, tomato, and special sauce',
        nullable: true
    })
    @Column({ type: 'text', nullable: true })
    description: string;

    @ApiProperty({
        description: 'Regular price of the food item',
        example: '9.99',
        type: String
    })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: string;

    @ApiProperty({
        description: 'URL to the food item image',
        example: 'https://example.com/images/chicken-burger.jpg',
        nullable: true
    })
    @Column({ type: 'text', nullable: true })
    imageUrl: string | null;

    @Column({ type: 'text', nullable: true })
    imageList: string;

    @ApiProperty({
        description: 'Whether the food item is available',
        example: true,
        default: true
    })
    @Column({ default: false })
    isAvailable: boolean;

    @ApiProperty({
        description: 'Category ID of the food item',
        example: 1
    })
    @Column()
    categoryId: number;

    @ApiProperty({
        description: 'Category of the food item',
        type: () => Category
    })
    @ManyToOne(() => Category, (category) => category.products, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
    category: Category;

    @OneToMany(() => OrderItem, (oi) => oi.product)
    orderItems: OrderItem[];

    @ApiProperty({
        description: 'Date when the food item was created',
        example: '2025-05-20T10:30:00.000Z'
    })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the food item was last updated',
        example: '2025-05-20T15:45:00.000Z'
    })
    @UpdateDateColumn()
    updatedAt: Date;

    @ApiProperty({
        description: 'Deleted Date',
        example: '2025-05-20T15:45:00.000Z'
    })
    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @OneToMany(() => Favorite, (favorite) => favorite.product, {
        createForeignKeyConstraints: false
    })
    favorites: Favorite[];

    @OneToMany(() => Cart, (cart) => cart.product, {
        createForeignKeyConstraints: false
    })
    carts: Cart[];

    @Column({ type: 'text', nullable: true })
    attributes: string;

    @Column({ type: 'text', nullable: true})
    attrGroups: string;
}
