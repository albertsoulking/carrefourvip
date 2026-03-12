import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { PaymentGatewayType } from '../enum/payment-gateways.enum';
import { PaymentGateway } from './payment-gateway.entity';

@Entity('payment_providers')
export class PaymentProvider {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 50 })
    code: string;

    @Column({ type: 'enum', enum: PaymentGatewayType })
    type: PaymentGatewayType;

    @OneToMany(() => PaymentGateway, (gateway) => gateway.provider, {
        createForeignKeyConstraints: false
    })
    gateway: PaymentGateway[];

    @Column({ length: 100 })
    remark: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
