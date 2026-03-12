import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
    OneToMany,
    DeleteDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/role/entity/role.entity';
import { RoleType } from 'src/role/enum/role.enum';
import { AdminPermission } from 'src/permission/entity/admin_permission.entity';
import { AdminMenu } from 'src/role/entity/admin_menu.entity';
import { Log } from 'src/system_log/entity/log.entity';
import { AdminNotification } from 'src/notification/entity/notification-admin.entity';

@Entity('admins')
export class Admin {
    @ApiProperty({
        description: 'Unique identifier for the admin user',
        example: 1,
        type: Number
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'Name of the admin user',
        example: 'John Doe',
        type: String
    })
    @Column()
    name: string;

    @ApiProperty({
        description: 'Email address of the admin (unique)',
        example: 'admin@foodpoint.com',
        uniqueItems: true,
        type: String
    })
    @Column({ unique: true })
    email: string;

    @ApiProperty({
        description: 'Hashed password of the admin user',
        example: '$2b$10$xyz...',
        type: String,
        writeOnly: true // Password won't be included in responses
    })
    @Column({ type: 'text' })
    password: string;

    @ApiProperty({
        description: 'Whether the admin account is active',
        example: true,
        default: true,
        type: Boolean
    })
    @Column({ default: true })
    status: boolean;

    @Column({ type: 'text', nullable: true })
    remark: string;

    @ApiProperty({
        description: 'Role of the admin',
        example: RoleType.ADMIN,
        type: () => Role
    })
    @ManyToOne(() => Role, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @ApiProperty({
        description: 'Unique referral code for user registration',
        example: 'ADMIN123',
        type: String
    })
    @Column({ unique: true, nullable: true })
    referralCode: string;

    @ManyToOne(() => Admin, (admin) => admin.children, {
        nullable: true,
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'parentId' })
    parent: Admin;

    @OneToMany(() => Admin, (admin) => admin.parent)
    children: Admin[];

    @OneToMany(() => AdminPermission, (ap) => ap.admin)
    adminPermissions: AdminPermission[];

    @OneToMany(() => AdminMenu, (am) => am.admin)
    adminMenus: AdminMenu[];

    @OneToMany(() => Log, (log) => log.admin)
    logs: Log[];

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ length: 100, nullable: true })
    state: string;

    @Column({ length: 20, nullable: true })
    zipCode: string;

    @Column({ length: 100, nullable: true })
    country: string;

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

    @Column({ type: 'tinyint', default: 0 })
    twoFactorEnabled: number;

    @Column({ type: 'text', nullable: true })
    twoFactorSecret: string | null;

    @ApiProperty({
        description: 'Date when the admin user was created',
        example: '2025-05-20T10:30:00.000Z',
        type: Date
    })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the admin user was last updated',
        example: '2025-05-20T15:45:00.000Z',
        type: Date
    })
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @OneToMany(() => AdminNotification, (an) => an.admin)
    notifications: AdminNotification[];
}
