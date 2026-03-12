import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('settings')
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    group: string;

    @Column({ type: 'text' })
    key: string;

    @Column({ type: 'text' })
    value: string;

    @Column({ type: 'text', nullable: true })
    remark: string;
}