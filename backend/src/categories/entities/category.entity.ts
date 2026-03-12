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
import { Product } from 'src/products/entity/products.entity';

@Entity('categories')
export class Category {
    @ApiProperty({
        description: 'Unique identifier for the category',
        example: 1,
        type: Number
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'Name of the category',
        example: 'Fast Food',
        maxLength: 100
    })
    @Column({ type: 'text' })
    name: string;

    @ApiProperty({
        description: 'Description of the category',
        example: 'Quick service food items including burgers, pizzas, etc.',
        nullable: true
    })
    @Column({ type: 'text', nullable: true })
    description: string;

    @ApiProperty({
        description: 'URL to the category image',
        example: 'https://example.com/images/fast-food.jpg',
        nullable: true
    })
    @Column({ nullable: true })
    imageUrl: string;

    @ApiProperty({
        description: 'Whether the category is active',
        example: true,
        default: true
    })
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty({
        description: 'Display order for sorting categories',
        example: 1,
        default: 0
    })
    @Column({ default: 0 })
    displayOrder: number;

    @ApiProperty({
        description: 'ID of the parent category',
        example: 1,
        nullable: true
    })
    @Column({ nullable: true })
    parentId: number;

    @ApiProperty({
        description: 'Parent category',
        type: () => Category,
        nullable: true
    })
    @ManyToOne(() => Category, (category) => category.children, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'parentId' })
    parent: Category;

    @ApiProperty({
        description: 'Child categories',
        type: () => [Category]
    })
    @OneToMany(() => Category, (category) => category.parent, {
        createForeignKeyConstraints: false
    })
    children: Category[];

    @ApiProperty({
        description: 'Date when the category was created',
        example: '2025-05-20T10:30:00.000Z'
    })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the category was last updated',
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

    @ApiProperty({
        description: 'Product items in this category',
        type: () => [Product]
    })
    @OneToMany(() => Product, (product) => product.category, {
        createForeignKeyConstraints: false
    })
    products: Product[];

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    vatPercent: number; // 2.1 / 5.5 / 10 / 20

    @Column({ default: false })
    isCollect: boolean;

    @Column({ nullable: true })
    bgImageUrl: string;
}
