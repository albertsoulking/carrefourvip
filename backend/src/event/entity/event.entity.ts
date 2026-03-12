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
import { EventTemplate, EventType } from '../enum/event.enum';
import { LuckyWheel } from 'src/lucky_wheel/entity/wheel.entity';
import { EventLog } from 'src/event_log/entity/event-log.entity';

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: EventTemplate })
    template: EventTemplate;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: EventType })
    type: EventType;

    @Column()
    remark: string;

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;

    @ManyToOne(() => LuckyWheel, (wheel) => wheel.events, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'luckyWheelId' })
    luckyWheel: LuckyWheel;

    @OneToMany(() => EventLog, (el) => el.event, {
        createForeignKeyConstraints: false
    })
    eventLog: EventLog[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
