import { Admin } from 'src/admin/entities/admin.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Permission } from './permission.entity';
import { PermissionAction } from '../enum/permission.enum';

@Entity('admin_permissions')
export class AdminPermission {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Admin, (admin) => admin.adminPermissions, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'adminId' })
    admin: Admin;

    @ManyToOne(() => Permission, (permission) => permission.adminPermissions, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'permissionId' })
    permission: Permission;

    @Column({ type: 'boolean' })
    enabled: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
