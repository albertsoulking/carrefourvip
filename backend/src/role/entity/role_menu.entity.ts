import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Role } from './role.entity';
import { Menu } from './menu.entity';

@Entity('role_menus')
export class RoleMenu {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Role, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @ManyToOne(() => Menu, (menu) => menu.roleMenus, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'menuId' })
    menu: Menu;
    
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
