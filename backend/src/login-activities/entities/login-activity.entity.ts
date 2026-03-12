import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { ApiProperty } from '@nestjs/swagger';
import { LoginType, UserType } from '../enum/login-activities.enum';

@Entity()
export class LoginActivity {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'Unique identifier for the login activity' })
    id: number;

    @Column({ nullable: true })
    @ApiProperty({
        description: 'ID of the user associated with this activity'
    })
    userId: number | null;

    @Column({ type: 'text' })
    @ApiProperty({ description: 'Type of user (user or admin)' })
    userType: UserType;

    @ManyToOne(() => User, {
        createForeignKeyConstraints: false,
        nullable: true
    })
    @JoinColumn({ name: 'userId' })
    @ApiProperty({
        description: 'The user associated with this activity',
        type: () => User,
        nullable: true
    })
    user: User | null;

    @ManyToOne(() => Admin, {
        createForeignKeyConstraints: false,
        nullable: true
    })
    @JoinColumn({ name: 'adminId' })
    @ApiProperty({
        description: 'The admin associated with this activity',
        type: () => Admin,
        nullable: true
    })
    admin: Admin | null;

    @Column({ type: 'text', default: LoginType.LOGIN })
    @ApiProperty({
        description: 'Type of login activity',
        enum: LoginType,
        example: LoginType.LOGIN
    })
    type: LoginType;

    @Column({ nullable: true })
    @ApiProperty({ description: 'IP address of the user' })
    ip: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Browser information' })
    browser: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Device information' })
    device: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Operating system information' })
    os: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Additional details about the login activity' })
    details: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ length: 100, nullable: true })
    state: string;

    @Column({ length: 20, nullable: true })
    zipCode: string;

    @Column({ length: 100, nullable: true })
    country: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
