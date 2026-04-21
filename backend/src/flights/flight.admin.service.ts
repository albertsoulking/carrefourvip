import {
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { FlightBooking } from './entities/flight-booking.entity';
import { SearchFlightBookingDto } from './dto/search-flight-booking.dto';
import { RoleType } from 'src/role/enum/role.enum';
import { UpdateFlightBookingDto } from './dto/update-flight-booking.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notification.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

@Injectable()
export class AdminFlightService {
    constructor(
        @InjectRepository(FlightBooking)
        private readonly flightBookingRepo: Repository<FlightBooking>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly notiService: NotificationService
    ) {}

    private async getScopedUserIds(admin: Admin): Promise<number[] | null> {
        if (admin.role.name === RoleType.TEAM) {
            const users = await this.userRepo.find({
                where: {
                    parent: { id: admin.id }
                },
                select: ['id']
            });

            return users.map((user) => user.id);
        }

        if (admin.role.name === RoleType.HEAD) {
            const teams = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.TEAM }
                },
                select: ['id']
            });

            const teamIds = teams.map((team) => team.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            return users.map((user) => user.id);
        }

        if (admin.role.name === RoleType.AGENT) {
            const heads = await this.adminRepo.find({
                where: {
                    parent: { id: admin.id },
                    role: { name: RoleType.HEAD }
                },
                select: ['id']
            });

            const headIds = heads.map((head) => head.id);
            const teams = await this.adminRepo.find({
                where: [
                    {
                        parent: { id: In(headIds) },
                        role: { name: RoleType.TEAM }
                    },
                    {
                        parent: { id: admin.id },
                        role: { name: RoleType.TEAM }
                    }
                ],
                select: ['id']
            });

            const teamIds = teams.map((team) => team.id);
            const users = await this.userRepo.find({
                where: [
                    { parent: { id: In(teamIds) } },
                    { parent: { id: In(headIds) } },
                    { parent: { id: admin.id } }
                ],
                select: ['id']
            });

            return users.map((user) => user.id);
        }

        return null;
    }

    async getAllFlightBookings(adminId: number, dto: SearchFlightBookingDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });

        if (!admin) {
            throw new UnauthorizedException();
        }

        const skip = (dto.page - 1) * dto.limit;
        const direction = dto.orderBy.toUpperCase() as 'ASC' | 'DESC';

        const query = this.flightBookingRepo
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.user', 'user')
            .leftJoinAndSelect('user.parent', 'parent');

        const scopedUserIds = await this.getScopedUserIds(admin);
        if (scopedUserIds && scopedUserIds.length > 0) {
            query.andWhere('user.id IN (:...scopedUserIds)', {
                scopedUserIds
            });
        } else if (scopedUserIds && scopedUserIds.length === 0) {
            query.andWhere('1 = 0');
        }

        if (dto.bookingReference) {
            query.andWhere('booking.bookingReference LIKE :bookingReference', {
                bookingReference: `%${dto.bookingReference}%`
            });
        }

        if (dto.contactName) {
            query.andWhere(
                '(booking.contactFirstName LIKE :contactName OR booking.contactLastName LIKE :contactName)',
                { contactName: `%${dto.contactName}%` }
            );
        }

        if (dto.contactEmail) {
            query.andWhere('booking.contactEmail LIKE :contactEmail', {
                contactEmail: `%${dto.contactEmail}%`
            });
        }

        if (dto.airlineCode) {
            query.andWhere('booking.airlineCode LIKE :airlineCode', {
                airlineCode: `%${dto.airlineCode}%`
            });
        }

        if (dto.originCode) {
            query.andWhere('booking.originCode LIKE :originCode', {
                originCode: `%${dto.originCode}%`
            });
        }

        if (dto.destinationCode) {
            query.andWhere('booking.destinationCode LIKE :destinationCode', {
                destinationCode: `%${dto.destinationCode}%`
            });
        }

        if (dto.status) {
            query.andWhere('booking.status = :status', {
                status: dto.status
            });
        }

        if (dto.fromDate) {
            query.andWhere('booking.createdAt >= :fromDate', {
                fromDate: dto.fromDate
            });
        }

        if (dto.toDate) {
            query.andWhere('booking.createdAt <= :toDate', {
                toDate: dto.toDate
            });
        }

        const sortFieldMap = {
            'user.name': 'user.name',
            'user.email': 'user.email',
            bookingReference: 'booking.bookingReference',
            departureAt: 'booking.departureAt',
            price: 'booking.price',
            status: 'booking.status',
            createdAt: 'booking.createdAt'
        };

        const sortField = sortFieldMap[dto.sortBy] ?? `booking.${dto.sortBy}`;

        const [data, total] = await query
            .skip(skip)
            .take(dto.limit)
            .orderBy(sortField, direction)
            .getManyAndCount();

        return {
            overview: null,
            data,
            total,
            page: dto.page,
            lastPage: Math.ceil(total / dto.limit)
        };
    }

    async updateFlightBooking(adminId: number, dto: UpdateFlightBookingDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId },
            relations: ['role']
        });

        if (!admin) {
            throw new UnauthorizedException();
        }

        const booking = await this.flightBookingRepo.findOne({
            where: { id: dto.id },
            relations: ['user']
        });

        if (!booking) {
            throw new NotFoundException(`Flight ID ${dto.id} not found.`);
        }

        if (dto.status !== booking.status && dto.status !== undefined) {
            booking.status = dto.status;

            await this.notiService.sendNotification({
                title: 'Flight Booking Status Update',
                userId: booking.user.id,
                content: `The status for the flight booking [#${booking.id}] has been updated to ${dto.status}`,
                type: NotificationType.FLIGHT_BOOKING,
                path: '/orders/flights',
                createdAt: new Date(),
                targetId: booking.id,
                userType: UserType.ADMIN,
                enableNoti: 0,
                extra: JSON.stringify({
                    url: dto.paymentLink
                })
            });
        }

        if (
            dto.paymentLink !== booking.paymentLink &&
            dto.paymentLink !== undefined
        ) {
            booking.paymentLink = dto.paymentLink;

            await this.notiService.sendNotification({
                title: 'Flight Booking Payment Link',
                userId: booking.user.id,
                content: `The payment link for the flight booking [#${booking.id}] has been automatically created`,
                type: NotificationType.FLIGHT_BOOKING,
                path: '/flight-booking',
                createdAt: new Date(),
                targetId: booking.id,
                userType: UserType.USER,
                enableNoti: 0,
                extra: JSON.stringify({
                    url: dto.paymentLink
                })
            });
        }

        this.flightBookingRepo.save(booking);

        return 'Updated';
    }
}
