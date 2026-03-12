import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { NotificationType } from '../enum/notification.enum';
import { AdminNotification } from './notification-admin.entity';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ type: 'text', nullable: true })
    path: string;

    @Column({ type: 'integer' })
    targetId: number;

    @Column('integer')
    userId: number;
    
    @Column({ type: 'enum', enum: UserType })
    userType: UserType;

    @OneToMany(() => AdminNotification, (an) => an.notification)
    adminNotification: AdminNotification[];

    @Column({ type: 'tinyint', default: 0 })
    enableNoti: number;

    @Column({ type: 'text', nullable: true})
    extra: string;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
