import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    DeleteDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TicketStatus } from '../enum/tickets.enum';
import { Message } from 'src/messages/entities/message.entity';

@Entity('tickets')
export class Ticket {
    @ApiProperty({ description: 'The unique identifier of the ticket' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'The user who created the ticket' })
    @ManyToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({ description: 'Subject of the ticket' })
    @Column({ type: 'text' })
    subject: string;

    @ApiProperty({
        description: 'Current status of the ticket',
        enum: TicketStatus,
        enumName: 'TicketStatus',
        default: TicketStatus.OPENED
    })
    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.OPENED
    })
    status: TicketStatus;

    @OneToMany(() => Message, (message) => message.ticket)
    messages: Message[];

    @ApiProperty({ description: 'When the ticket was created' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'When the ticket was last updated' })
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;
}
