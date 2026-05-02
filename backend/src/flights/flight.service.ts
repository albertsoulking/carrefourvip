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

type FlightSearchMarket = 'us' | 'sg' | 'default';

@Injectable()
export class FlightService {
    constructor(
        @InjectRepository(FlightBooking)
        private readonly flightBookingRepo: Repository<FlightBooking>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {}

    private token = process.env.TP_TOKEN;

    private readonly pricesForDatesUrl =
        'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';

    /** Parallel searches: US market, SG market, and API default (no `market` param). */
    private readonly searchMarketVariants: Array<{
        key: FlightSearchMarket;
        /** Omit to leave `market` unset (Travelpayouts default). */
        marketParam?: string;
    }> = [
        { key: 'us', marketParam: 'us' }
    ];

    private generateBookingReference() {
        const now = new Date();
        const stamp = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('');

        return `FB-${stamp}-${uuidv4().split('-')[0].toUpperCase()}`;
    }

    private mapPriceItemToFlight(
        item: Record<string, any>,
        origin: string,
        destination: string,
        market: FlightSearchMarket
    ) {
        const link = item.link != null ? String(item.link) : '';

        return {
            id: `${market}:${link}`,
            link,
            market,
            price: item.price,
            airlineCode: item.airline,
            departure: item.departure_at,
            return: item.return_at,
            duration: '2h ~ 5h',
            from: origin,
            to: destination
        };
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

        const baseParams: Record<string, any> = {
            origin,
            destination,
            departure_at: departureDate,
            currency: 'eur',
            children,
            adults,
            trip_class: tripClass,
            token: this.token
        };

        if (!oneWay && returnDate) {
            baseParams.return_at = returnDate;
        }

        const requests = this.searchMarketVariants.map(
            async ({ key, marketParam }) => {
                try {
                    const params = { ...baseParams };
                    if (marketParam !== undefined) {
                        params.market = marketParam;
                    }

                    const res = await axios.get(this.pricesForDatesUrl, {
                        params
                    });

                    const data = res.data?.data || [];

                    return (data as Record<string, any>[]).map((item) =>
                        this.mapPriceItemToFlight(item, origin, destination, key)
                    );
                } catch (err) {
                    const message =
                        err instanceof Error ? err.message : String(err);
                    console.error(
                        `Flight search API error (market=${key}):`,
                        message
                    );
                    return [];
                }
            }
        );

        try {
            const batches = await Promise.all(requests);
            return batches.flat();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : String(err);
            console.error('Flight search API error:', message);
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

        const expectedPassengerCount =
            Number(dto.adults) + Number(dto.children);

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

    async getAllFlightBooking(userId: number) {
        const bookings = await this.flightBookingRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });

        return bookings.map((b) => ({
            id: b.id,
            bookingReference: b.bookingReference,
            status: b.status,

            airlineName: b.airlineName,

            originCode: b.originCode,
            destinationCode: b.destinationCode,
            originCity: b.originCity,
            destinationCity: b.destinationCity,

            departureAt: b.departureAt,

            passengerName: `${b.contactFirstName} ${b.contactLastName}`,

            currency: b.currency,
            price: b.price,

            providerLink: b.providerLink,
            paymentLink: b.paymentLink
        }));
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
