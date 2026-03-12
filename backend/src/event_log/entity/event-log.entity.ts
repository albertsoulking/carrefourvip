import { Event } from 'src/event/entity/event.entity';
import { User } from 'src/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { RewardType } from '../enum/event-log.enum';

@Entity('event_logs')
export class EventLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.eventLog, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Event, (event) => event.eventLog, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'eventId' })
    event: Event;

    @Column({ type: 'enum', enum: RewardType })
    type: RewardType;

    @Column({ type: 'text' })
    reward: string;

    @Column({ type: 'tinyint', default: 0 })
    isClaim: number;

    @Column({ type: 'timestamp', default: null })
    claimAt: Date;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
