import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { FlightBooking } from './entities/flight-booking.entity';
import { SearchFlightBookingDto } from './dto/search-flight-booking.dto';
import { RoleType } from 'src/role/enum/role.enum';

@Injectable()
export class AdminFlightService {
    constructor(
        @InjectRepository(FlightBooking)
        private readonly flightBookingRepo: Repository<FlightBooking>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
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

        const sortField =
            sortFieldMap[dto.sortBy] ?? `booking.${dto.sortBy}`;

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
}
