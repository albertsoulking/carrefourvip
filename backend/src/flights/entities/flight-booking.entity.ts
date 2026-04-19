import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import {
    FlightBookingStatus,
    FlightCabinClass,
    FlightDocumentType,
    FlightPassengerType,
    FlightTripType
} from '../enum/flight-booking.enum';

export interface FlightPassengerSnapshot {
    passengerType: FlightPassengerType;
    title: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    nationality: string;
    documentType: FlightDocumentType;
    documentNumber: string;
    documentExpiry: string;
}

@Entity('flight_bookings')
export class FlightBooking {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'integer' })
    userId: number;

    @Column({ type: 'varchar', length: 40, unique: true })
    bookingReference: string;

    @Column({
        type: 'enum',
        enum: FlightBookingStatus,
        default: FlightBookingStatus.SUBMITTED
    })
    status: FlightBookingStatus;

    @Column({ type: 'varchar', length: 10 })
    airlineCode: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    airlineName: string;

    @Column({ type: 'varchar', length: 10 })
    originCode: string;

    @Column({ type: 'varchar', length: 120, nullable: true })
    originCity: string;

    @Column({ type: 'varchar', length: 180, nullable: true })
    originAirportName: string;

    @Column({ type: 'varchar', length: 10 })
    destinationCode: string;

    @Column({ type: 'varchar', length: 120, nullable: true })
    destinationCity: string;

    @Column({ type: 'varchar', length: 180, nullable: true })
    destinationAirportName: string;

    @Column({ type: 'datetime' })
    departureAt: Date;

    @Column({ type: 'datetime', nullable: true })
    returnAt: Date;

    @Column({
        type: 'enum',
        enum: FlightTripType,
        default: FlightTripType.ONEWAY
    })
    tripType: FlightTripType;

    @Column({
        type: 'enum',
        enum: FlightCabinClass,
        default: FlightCabinClass.ECONOMY
    })
    cabinClass: FlightCabinClass;

    @Column({ type: 'integer', default: 1 })
    adultCount: number;

    @Column({ type: 'integer', default: 0 })
    childCount: number;

    @Column({ type: 'integer', default: 1 })
    passengerCount: number;

    @Column({ type: 'varchar', length: 10, default: 'USD' })
    currency: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    contactTitle: string;

    @Column({ type: 'varchar', length: 100 })
    contactFirstName: string;

    @Column({ type: 'varchar', length: 100 })
    contactLastName: string;

    @Column({ type: 'varchar', length: 150 })
    contactEmail: string;

    @Column({ type: 'varchar', length: 30 })
    contactPhone: string;

    @Column({ type: 'text', nullable: true })
    specialRequests: string;

    @Column({ type: 'text', nullable: true })
    providerLink: string;

    @Column({ type: 'simple-json' })
    passengers: FlightPassengerSnapshot[];

    @Column({ type: 'simple-json', nullable: true })
    flightSnapshot: Record<string, any> | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
}
