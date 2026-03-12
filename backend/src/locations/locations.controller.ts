import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpStatus,
    Req
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { Location } from './entity/location.entity';
import { Request } from 'express';

@ApiTags('locations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) {}

    @Post('create-location')
    @ApiOperation({
        summary: 'Create a new location for the authenticated user'
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Location created successfully',
        type: Location
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User not authenticated'
    })
    createOne(
        @Req() req: Request,
        @Body() createLocationDto: CreateLocationDto
    ) {
        const userId = (req as any)?.user.id;
        return this.locationsService.createOne(userId, createLocationDto);
    }

    @Post('get-my-locations')
    @ApiOperation({ summary: 'Get all locations for the authenticated user' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns all locations',
        type: [Location]
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User not authenticated'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid user ID'
    })
    getMyLocations(@Req() req: Request) {
        const userId = (req as any)?.user.id;
        return this.locationsService.findMyLocations(userId);
    }

    @Post('update-location')
    @ApiOperation({ summary: 'Update a location' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Location updated successfully',
        type: Location
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Location not found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or ID'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User not authenticated'
    })
    updateOne(
        @Req() req: Request,
        @Body() updateLocationDto: UpdateLocationDto
    ) {
        const userId = (req as any)?.user.id;
        return this.locationsService.updateOne(userId, updateLocationDto);
    }

    @Post('delete-location')
    @ApiOperation({ summary: 'Delete a location' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Location deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Location not found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid ID format'
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User not authenticated'
    })
    removeOne(@Req() req: Request, @Body() body: any) {
        const userId = (req as any)?.user.id;
        return this.locationsService.removeOne(userId, body.id);
    }
}
