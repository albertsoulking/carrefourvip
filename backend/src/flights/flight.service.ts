import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { SearchFlightDto } from './dto/search-flight.dto';
import { FlightBooking } from './entities/flight-booking.entity';
import { CreateFlightBookingDto } from './dto/create-flight-booking.dto';
import { FlightBookingStatus } from './enum/flight-booking.enum';

@Injectable()
export class FlightService {
    constructor(
        @InjectRepository(FlightBooking)
        private readonly flightBookingRepo: Repository<FlightBooking>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {}

    private token = process.env.TP_TOKEN;

    private generateBookingReference() {
        const now = new Date();
        const stamp = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('');

        return `FB-${stamp}-${uuidv4().split('-')[0].toUpperCase()}`;
    }

    async searchFlights(dto: SearchFlightDto) {
        const {
            origin,
            destination,
            departureDate,
            returnDate,
            tripClass,
            adults,
            children,
            oneWay
        } = dto;

        try {
            const params: any = {
                origin,
                destination,
                departure_at: departureDate,
                currency: 'usd',
                market: 'us',
                children,
                adults,
                trip_class: tripClass,
                token: this.token
            };

            // ✅ 只有往返才加
            if (!oneWay && returnDate) {
                params.return_at = returnDate;
            }

            const res = await axios.get(
                'https://api.travelpayouts.com/aviasales/v3/prices_for_dates',
                { params }
            );

            const data = res.data?.data || [];
            console.log('data', res.data);

            return data.map((item: any) => ({
                id: item.link,
                price: item.price,
                airlineCode: item.airline,
                departure: item.departure_at,
                return: item.return_at,
                duration: '2h ~ 5h',
                from: origin,
                to: destination
            }));
        } catch (err) {
            console.error('API ERROR:', err.message);
            return [];
        }
    }

    async createBooking(userId: number, dto: CreateFlightBookingDto) {
        const user = await this.userRepo.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException(`User ID ${userId} not found`);
        }

        const expectedPassengerCount = Number(dto.adults) + Number(dto.children);

        if (dto.passengers.length !== expectedPassengerCount) {
            throw new BadRequestException(
                'Passenger count does not match adults and children selection.'
            );
        }

        const booking = this.flightBookingRepo.create({
            user,
            userId,
            bookingReference: this.generateBookingReference(),
            status: FlightBookingStatus.SUBMITTED,
            airlineCode: dto.airlineCode,
            airlineName: dto.airlineName || undefined,
            originCode: dto.originCode,
            originCity: dto.originCity || undefined,
            originAirportName: dto.originAirportName || undefined,
            destinationCode: dto.destinationCode,
            destinationCity: dto.destinationCity || undefined,
            destinationAirportName: dto.destinationAirportName || undefined,
            departureAt: new Date(dto.departureAt),
            returnAt: dto.returnAt ? new Date(dto.returnAt) : undefined,
            tripType: dto.tripType,
            cabinClass: dto.cabinClass,
            adultCount: dto.adults,
            childCount: dto.children,
            passengerCount: dto.passengers.length,
            currency: dto.currency || 'USD',
            price: dto.price.toFixed(2),
            contactTitle: dto.contactTitle || undefined,
            contactFirstName: dto.contactFirstName,
            contactLastName: dto.contactLastName,
            contactEmail: dto.contactEmail,
            contactPhone: dto.contactPhone,
            specialRequests: dto.specialRequests || undefined,
            providerLink: dto.providerLink || undefined,
            passengers: dto.passengers,
            flightSnapshot: dto.flightSnapshot || undefined
        });

        const savedBooking = await this.flightBookingRepo.save(booking);

        return {
            id: savedBooking.id,
            bookingReference: savedBooking.bookingReference,
            status: savedBooking.status
        };
    }

    // 🔥 fallback 假数据（防止空数据）
    generateFakeFlights(origin: string, destination: string) {
        const airlineCodes = ['AK', 'MH', 'TG'];

        return Array.from({ length: 5 }).map((_, i) => ({
            id: `fake-${i}`,
            airlineCode:
                airlineCodes[Math.floor(Math.random() * airlineCodes.length)],
            from: origin,
            to: destination,
            departure: `2026-05-0${i + 1}T08:00:00`,
            duration: '2h 15m',
            price: 80 + Math.floor(Math.random() * 100),
            fake: true
        }));
    }
}
