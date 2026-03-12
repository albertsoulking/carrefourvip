import {
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../locations/entity/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private readonly locationRepo: Repository<Location>,
        private readonly userService: UsersService
    ) {}

    async createOne(
        userId: number,
        dto: CreateLocationDto
    ): Promise<Location> {
        const location = this.locationRepo.create({
            ...dto,
            userId
        });

        await this.userService.updateLastLogin(userId);

        return await this.locationRepo.save(location);
    }

    async findMyLocations(userId: number): Promise<Location[]> {
        await this.userService.updateLastLogin(userId);

        return this.locationRepo.find({
            where: { userId },
            order: { isPrimary: 'DESC', createdAt: 'DESC' }
        });
    }

    async findOne(userId: number, id: number): Promise<Location> {
        const location = await this.locationRepo.findOne({
            where: { id }
        });

        if (!location) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }

        await this.userService.updateLastLogin(userId);

        return location;
    }

    async updateOne(
        userId: number,
        dto: UpdateLocationDto
    ): Promise<Location> {
        // If updating isPrimary to true, unset any existing primary locations
        if (dto.isPrimary) {
            await this.locationRepo.update(
                { user: { id: userId } },
                { isPrimary: false }
            );
            await this.locationRepo.update(
                { id: dto.id },
                { isPrimary: true }
            );
        }

        // Update the location
        await this.locationRepo.update(
            dto.id,
            dto
        );

        // Fetch and return the updated location
        return this.findOne(userId, dto.id);
    }

    async removeOne(userId: number, id: number): Promise<void> {
        // Check if the location exists and belongs to the user
        await this.findOne(userId, id);

        // Delete the location
        const result = await this.locationRepo.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }
    }
}
