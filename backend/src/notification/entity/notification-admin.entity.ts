import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Notification } from './notification.entity';
import { Admin } from 'src/admin/entities/admin.entity';

@Entity('admin_notifications')
export class AdminNotification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Notification, (n) => n.adminNotification, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'notificationId' })
    notification: Notification;

    @Column()
    notificationId: number;

    @ManyToOne(() => Admin, (admin) => admin.notifications, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'adminId' })
    admin: Admin;

    @Column()
    adminId: number;

    @Column({ type: 'tinyint', default: 0 })
    isRead: number;

    @Column({ type: 'datetime', nullable: true })
    readAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
