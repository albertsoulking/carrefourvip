import { Admin } from 'src/admin/entities/admin.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Menu } from './menu.entity';

@Entity('admin_menus')
export class AdminMenu {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Admin, (admin) => admin.adminMenus, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'adminId' })
    admin: Admin;

    @OneToOne(() => Menu, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'menuId' })
    menu: Menu;

    @Column({ type: 'boolean' })
    enabled: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
