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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Admin } from '../../admin/entities/admin.entity';
import { Location } from '../../locations/entity/location.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Order } from '../../orders/entities/order.entity';
import { Favorite } from 'src/favorites/entity/favorites.entity';
import { Cart } from 'src/cart/entity/cart.entity';
import { Role } from 'src/role/entity/role.entity';
import { RoleType } from 'src/role/enum/role.enum';
import { UserMode } from '../enum/user.enum';
import { Log } from 'src/system_log/entity/log.entity';
import { EventLog } from 'src/event_log/entity/event-log.entity';


@Entity('users')
export class User {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: 1,
        type: Number
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
        maxLength: 100
    })
    @Column({ type: 'text' })
    name: string;

    @ApiProperty({
        description: 'Username for the user',
        example: 'john_doe',
        maxLength: 100
    })
    @Column({ type: 'text', unique: true })
    username: string;

    @ApiProperty({
        description: 'User avatar',
        example: 'user-avatar.jpg',
        type: String,
        required: false
    })
    @Column({ type: 'text', nullable: true })
    avatar: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john@example.com',
        maxLength: 150
    })
    @Column({ type: 'text', unique: true })
    email: string;

    @ApiProperty({
        description: 'Phone number of the user',
        example: '+1234567890',
        maxLength: 20
    })
    @Column({ type: 'text', unique: true })
    phone: string;

    @ApiProperty({
        description: 'Hashed password of the user',
        example: '$2b$10$xyz...',
        writeOnly: true
    })
    @Column({ type: 'text' })
    password: string;

    @ApiProperty({
        description: 'Whether the user account is active',
        example: true,
        default: true
    })
    @Column({ default: true })
    status: boolean;

    @Column({ type: 'text', nullable: true })
    remark: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    balance: string;

    @ApiProperty({
        description: 'Role of the user',
        example: RoleType.CUSTOMER,
        type: () => Role
    })
    @ManyToOne(() => Role, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @ManyToOne(() => Admin, {
        nullable: true,
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'parentId' })
    parent: Admin | null;

    @ApiProperty({
        description: 'Whether the email is verified',
        example: false,
        default: false
    })
    @Column({ default: false })
    emailVerified: boolean;

    @ApiProperty({
        description: 'Whether the mobile number is verified',
        example: false,
        default: false
    })
    @Column({ default: false })
    mobileVerified: boolean;

    @ApiProperty({
        description: 'Whether two-factor authentication is enabled',
        example: false,
        default: false
    })
    @Column({ default: false })
    twoFactorEnabled: boolean;

    @ApiProperty({
        description: 'Whether KYC verification is completed',
        example: false,
        default: false
    })
    @Column({ default: false })
    kycVerified: boolean;

    @ApiProperty({
        description: 'City',
        example: 'New York',
        nullable: true
    })
    @Column({ length: 100, nullable: true })
    city: string;

    @ApiProperty({
        description: 'State/Province/Region',
        example: 'NY',
        nullable: true
    })
    @Column({ length: 100, nullable: true })
    state: string;

    @ApiProperty({
        description: 'ZIP/Postal code',
        example: '10001',
        nullable: true
    })
    @Column({ length: 20, nullable: true })
    zipCode: string;

    @ApiProperty({
        description: 'Country',
        example: 'USA',
        nullable: true
    })
    @Column({ length: 100, nullable: true })
    country: string;

    @ApiProperty({
        description: 'Referral code used to register',
        example: 'ADMIN123'
    })
    @Column({ nullable: true })
    referralCode: string;

    @ApiProperty({
        description: 'Date when the user was created',
        example: '2025-05-20T10:30:00.000Z'
    })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the user was last updated',
        example: '2025-05-20T15:45:00.000Z'
    })
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @ApiProperty({
        description: 'User locations',
        type: () => [Location]
    })
    @OneToMany(() => Location, (location) => location.user, {
        createForeignKeyConstraints: false
    })
    locations: Location[];

    @OneToMany(() => Transaction, (transaction) => transaction.user, {
        createForeignKeyConstraints: false
    })
    transactions: Transaction[];

    @ApiPropertyOptional({
        description: 'List of orders placed by the user',
        type: () => [Order],
        isArray: true
    })
    @OneToMany(() => Order, (order) => order.user, {
        createForeignKeyConstraints: false
    })
    orders: Order[];

    @OneToMany(() => Favorite, (favorite) => favorite.user, {
        createForeignKeyConstraints: false
    })
    favorites: Favorite[];

    @OneToMany(() => Cart, (cart) => cart.user, {
        createForeignKeyConstraints: false
    })
    carts: Cart[];

    @Column({ type: 'enum', enum: UserMode, default: UserMode.LIVE })
    mode: UserMode

    @Column({ length: 100, nullable: true })
    ip: string;

    @Column({ length: 100, nullable: true })
    latitude: string;

    @Column({ length: 100, nullable: true })
    longitude: string;

    @Column({ length: 100, nullable: true })
    loginIp: string;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @OneToMany(() => Log, log => log.user, {
        createForeignKeyConstraints: false
    })
    logs: Log[];

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    point: string;

    @OneToMany(() => EventLog, el => el.user, {
        createForeignKeyConstraints: false
    })
    eventLog: EventLog[];
}
