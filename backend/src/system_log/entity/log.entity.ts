import { Admin } from 'src/admin/entities/admin.entity';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { User } from 'src/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('system_logs')
export class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: UserType })
    userType: UserType;

    @ManyToOne(() => Admin, (admin) => admin.logs, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'adminId' })
    admin: Admin | null;

    @ManyToOne(() => User, user => user.logs, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'userId' })
    user: User | null;

    @Column()
    action: string;

    @Column()
    targetType: string;

    @Column({ nullable: true })
    targetId: number;

    @Column({ type: 'text' })
    description: string;

    @Column()
    ipAddress: string;

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
