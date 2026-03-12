import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
    PaymentGatewayStatus,
    PaymentGatewayType
} from '../enum/payment-gateways.enum';
import { PaymentProvider } from './payment-provider.entity';

@Entity('payment_gateways')
export class PaymentGateway {
    @ApiProperty({
        description: 'The unique identifier of the payment gateway'
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'The name of the payment gateway' })
    @Column({ length: 100 })
    name: string;

    @ManyToOne(() => PaymentProvider, (provider) => provider.gateway, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'providerId' })
    provider: PaymentProvider;

    @Column({ type: 'text', nullable: true })
    currency: string;

    @ApiProperty({
        description: 'Configuration for the payment gateway (stored as JSON)'
    })
    @Column({ type: 'text', nullable: true })
    config: string;

    @ApiProperty({
        description: 'Status of the payment gateway',
        enum: PaymentGatewayStatus,
        default: PaymentGatewayStatus.INACTIVE
    })
    @Column({
        type: 'enum',
        enum: PaymentGatewayStatus,
        default: PaymentGatewayStatus.INACTIVE
    })
    status: PaymentGatewayStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    feePercent: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    feeFixed: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    minAmount: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    maxAmount: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discount: string;

    @Column({ type: 'integer', default: 0 })
    sortOrder: number;

    @Column({ type: 'tinyint', default: 0 })
    isDefault: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'text', nullable: true })
    notices: string;

    @Column({ type: 'text', nullable: true })
    blackList: string;

    @Column({ type: 'tinyint', default: 1 })
    isManual: number;

    @Column({ type: 'text', nullable: true })
    logo: string;

    @Column({ type: 'text', nullable: true })
    images: string;

    @Column({ type: 'text', nullable: true })
    exLogos: string;

    @Column({ type: 'tinyint', default: 0 })
    visible: number;

    @ApiProperty({ description: 'Date when the payment gateway was created' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the payment gateway was last updated'
    })
    @UpdateDateColumn()
    updatedAt: Date;
}
