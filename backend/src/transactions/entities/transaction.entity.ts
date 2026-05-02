import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
    CreateDateColumn,
    OneToOne
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import {
    TransactionDirection,
    TransactionMethod,
    TransactionStatus,
    TransactionType
} from '../enum/transactions.enum';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    transactionNumber: string;

    @ManyToOne(() => User, (user) => user.transactions, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    postBalance: string;

    @OneToOne(() => Order, (order) => order.transaction, {
        nullable: true,
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column({ type: 'enum', enum: TransactionDirection })
    direction: TransactionDirection;

    @Column({ type: 'enum', enum: TransactionMethod })
    method: TransactionMethod;

    @Column({ type: 'enum', enum: TransactionMethod })
    hybridMethod: TransactionMethod;

    @Column({ type: 'enum', enum: TransactionType })
    type: TransactionType;

    @Column({ type: 'enum', enum: TransactionStatus })
    status: TransactionStatus;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reference: string | null;

    @Column({ type: 'text', nullable: true })
    remark: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    proofImage: string | null;

    /** Public URL to the uploaded payment proof image */
    @Column({ type: 'varchar', length: 512, nullable: true })
    proofImageUrl: string | null;

    @Column({ type: 'varchar', length: 8, default: 'EUR' })
    currency: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    beforeBalance: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    afterBalance: string | null;

    @Column({ type: 'datetime', nullable: true })
    processedAt: Date | null;

    @ManyToOne(() => Admin, {
        nullable: true,
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'processedById' })
    processedBy: Admin | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
