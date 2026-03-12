import { Event } from 'src/event/entity/event.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('lucky_wheels')
export class LuckyWheel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text' })
    prizes: string;

    @OneToMany(() => Event, (event) => event.luckyWheel, {
        createForeignKeyConstraints: false
    })
    events: Event[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
