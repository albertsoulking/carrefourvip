import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Role } from 'src/role/entity/role.entity';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admin/entities/admin.entity';

@Entity('messages')
export class Message {
    @ApiProperty({ description: 'Unique identifier of the message' })
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Ticket, (ticket) => ticket.messages, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'ticketId' })
    ticket: Ticket;

    @Column()
    senderId: number;

    @ManyToOne(() => Role, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'senderRoleId' })
    senderRole: Role;

    @ApiProperty({ description: 'Message content' })
    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'tinyint', default: 0 })
    isRead: number;

    @ApiProperty({ description: 'When the message was created' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'When the message was last updated' })
    @UpdateDateColumn()
    updatedAt: Date;

    sender?: User | Admin | null;

    @Column({ type: 'timestamp', nullable: true })
    readAt: Date;
}
