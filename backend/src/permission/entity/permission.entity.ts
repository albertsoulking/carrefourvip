import { Menu } from 'src/role/entity/menu.entity';
import { Role } from 'src/role/entity/role.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { AdminPermission } from './admin_permission.entity';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    name: string;

    @ManyToOne(() => Menu, (menu) => menu.permissions, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'menuId' })
    menu: Menu;

    @OneToMany(() => AdminPermission, (ap) => ap.admin, { createForeignKeyConstraints: false })
    adminPermissions: AdminPermission[];

    @Column({ type: 'text' })
    description: string;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
