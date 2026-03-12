import { RolePermission } from 'src/permission/entity/role_permission.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string; // admin, agent, head, team, customer,

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, {
        createForeignKeyConstraints: false
    })
    rolePermissions: RolePermission[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
