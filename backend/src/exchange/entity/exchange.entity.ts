import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('exchange-rate')
export class ExchangeRate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fromCurrency: string;

    @Column()
    toCurrency: string;

    @Column()
    rate: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
