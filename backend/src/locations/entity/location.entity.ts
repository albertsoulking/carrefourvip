import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('locations')
export class Location {
  @ApiProperty({
    description: 'Unique identifier for the location',
    example: 1,
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID who owns this location',
    example: 1,
    type: Number,
  })
  @Column()
  userId: number;

  @ApiProperty({
    description: 'Address line',
    example: '123 Main Street, Apt 4B',
    maxLength: 255,
  })
  @Column({ type: 'text' })
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
    maxLength: 100,
  })
  @Column({ type: 'text' })
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'NY',
    maxLength: 100,
  })
  @Column({ type: 'text' })
  state: string;

  @ApiProperty({
    description: 'Postal/Zip code',
    example: '10001',
    maxLength: 20,
  })
  @Column({ type: 'text' })
  postalCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
    maxLength: 100,
  })
  @Column({ type: 'text' })
  country: string;

  @ApiProperty({
    description: 'Whether this is the primary location',
    example: true,
    default: false,
  })
  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: 'text', nullable: true })
  receiverName: string;

  @Column({ type: 'text', nullable: true })
  receiverMobile: string
  
  @ManyToOne(() => User, user => user.locations, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'Date when the location was created',
    example: '2025-05-20T10:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the location was last updated',
    example: '2025-05-20T15:45:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
