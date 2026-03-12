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
import { RoleMenu } from './role_menu.entity';
import { Permission } from 'src/permission/entity/permission.entity';

@Entity('menus')
export class Menu {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    path: string;

    @Column({ nullable: true })
    icon: string;

    @ManyToOne(() => Menu, (menu) => menu.children, {
        nullable: true,
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'parentId' })
    parent: Menu;

    @OneToMany(() => Menu, (menu) => menu.parent)
    children: Menu[];

    @Column({ default: 0 })
    sortOrder: number;

    @OneToMany(() => RoleMenu, (rm) => rm.menu)
    roleMenus: RoleMenu[];

    @OneToMany(() => Permission, (perm) => perm.menu)
    permissions: Permission[];

    @Column({ type: 'tinyint' })
    visible: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
