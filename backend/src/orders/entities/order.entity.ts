import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToOne
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransactionMethod } from 'src/transactions/enum/transactions.enum';
import {
    DeliveryMethod,
    OrderStatus,
    PaymentStatus
} from '../enums/order.enum';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.orders, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'integer' })
    userId: number;

    // @ManyToOne(() => Coupon, { nullable: true, createForeignKeyConstraints: false })
    // @JoinColumn({ name: 'couponId', referencedColumnName: 'id' })
    // coupon: Coupon;

    // @Column({ type: 'integer', nullable: true })
    // couponId: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    vat: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    deliveryFee: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    balanceDeduct: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountPayPal: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalPrice: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    payAmount: string;

    @Column({ type: 'enum', enum: TransactionMethod })
    payMethod: TransactionMethod;

    @Column({ type: 'enum', enum: TransactionMethod })
    hybridMethod: TransactionMethod;

    @Column({ type: 'enum', enum: DeliveryMethod })
    deliveryMethod: DeliveryMethod;

    @Column({ type: 'boolean', default: false })
    deliveryMethodChanged: boolean;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    status: OrderStatus;

    @Column({ type: 'text', nullable: true })
    userAddress: string;

    @Column({ type: 'text', nullable: true })
    userMobile: string;

    @Column({ type: 'text', nullable: true })
    userName: string;

    @Column({ type: 'text', nullable: true })
    imageUrl: string;

    @Column({ type: 'integer' })
    quantity: number;

    @OneToMany(() => OrderItem, (item) => item.order, {
        createForeignKeyConstraints: false
    })
    items: OrderItem[];

    @OneToOne(() => Transaction, (transaction) => transaction.order, {
        createForeignKeyConstraints: false
    })
    transaction: Transaction;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    paymentStatus: PaymentStatus;

    @Column({ type: 'text', nullable: true })
    paymentLink: string;

    @Column({ type: 'text', nullable: true })
    shareLink: string;

    @Column({ type: 'datetime', nullable: true })
    paidAt: Date;

    @Column({ type: 'datetime', nullable: true })
    estimatedProcessingAt: Date;

    @Column({ type: 'datetime', nullable: true })
    processingAt: Date;

    @Column({ type: 'datetime', nullable: true })
    estimatedShippedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    shippedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    estimatedDeliveredAt: Date;

    @Column({ type: 'datetime', nullable: true })
    deliveredAt: Date;

    @Column({ type: 'datetime', nullable: true })
    cancelledAt: Date;

    @Column({ type: 'datetime', nullable: true })
    refundedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @Column({ type: 'text', nullable: true })
    uuid: string;

    @Column({ type: 'text', nullable: true })
    deliveryProofImages: string;

    @Column({ type: 'text', nullable: true })
    paypalResponseRaw: string;

    /** User-uploaded payment transfer proof (file name under uploads/images/) */
    @Column({ type: 'varchar', length: 255, nullable: true })
    paymentProofImage: string | null;
}
