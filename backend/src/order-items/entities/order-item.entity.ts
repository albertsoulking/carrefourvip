import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from 'src/products/entity/products.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'integer' })
    orderId: number;

    @Column({ type: 'integer' })
    userId: number;

    @Column({ type: 'integer', nullable: true })
    productId: number;

    @Column({ type: 'text' })
    productName: string;

    @Column({ type: 'text', nullable: true })
    productImage: string;

    @Column({ type: 'text', nullable: true })
    productDesc: string;

    @Column({ type: 'text', nullable: true })
    categoryName: string;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    basePrice: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    attrPrice: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    unitPrice: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalPrice: string;

    @ManyToOne(() => Product, (product) => product.orderItems, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
    product: Product;

    @ManyToOne(() => Order, (order) => order.items, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'orderId', referencedColumnName: 'id' })
    order: Order;

    @ManyToOne(() => User, { eager: false, createForeignKeyConstraints: false })
    @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'id' })
    user: User;

    @Column({ type: 'text' ,nullable: true})
    attributes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    // Helper method to calculate line total
    getLineTotal(): number {
        return Number(this.unitPrice) * this.quantity;
    }
}
