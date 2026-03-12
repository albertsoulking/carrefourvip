import { Role } from "src/role/entity/role.entity";
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Permission } from "./permission.entity";

@Entity('role_permissions')
export class RolePermission {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Role, (role) => role.rolePermissions, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @ManyToOne(() => Permission, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'permissionId' })
    permission: Permission;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
};
