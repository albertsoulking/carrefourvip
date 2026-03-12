import {
    Controller,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    BadRequestException,
    Req
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { Request } from 'express';
import { RoleType } from 'src/role/enum/role.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // Public endpoint for user registration
    @Post('register')
    @ApiOperation({
        summary: 'Register a new user',
        description:
            'Creates a new user account. Requires a valid admin referral code. Profile image is optional (max 5MB, jpg/jpeg/png).'
    })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        type: User
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid data or referral code'
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - email, username, or phone already exists'
    })
    @ApiBody({
        description: 'User registration data with optional profile image',
        schema: {
            type: 'object',
            required: [
                'name',
                'username',
                'email',
                'phone',
                'password',
                'referralCode'
            ],
            properties: {
                profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile image file (max 5MB, jpg/jpeg/png)'
                },
                name: { type: 'string', example: 'John Doe' },
                username: { type: 'string', example: 'johndoe' },
                email: { type: 'string', example: 'john@example.com' },
                phone: { type: 'string', example: '+1234567890' },
                password: { type: 'string', example: 'password123' },
                referralCode: { type: 'string', example: 'ADMIN123' },
                address: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' },
                latitude: { type: 'number', example: 40.7128 },
                longitude: { type: 'number', example: -74.006 }
            }
        }
    })
    async register(@Req() req: Request, @Body() dto: CreateUserDto) {
        return this.usersService.create(dto, req);
    }

    @Post('get-one-user')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get a specific user by ID',
        description:
            'Returns details of a specific user. Users can only access their own profiles unless they are admins.'
    })
    @ApiParam({ name: 'id', description: 'User ID', type: Number })
    @ApiResponse({ status: 200, description: 'User details', type: User })
    @ApiResponse({ status: 400, description: 'Bad request - invalid user ID' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - user with this ID does not exist'
    })
    async findOne(@Req() req: Request) {
        const userId = (req as any)?.user.id;

        return this.usersService.findOne(userId);
    }

    @Post('update-one-user')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Update a user',
        description:
            'Updates a user with the provided details. Users can only update their own profiles unless they are admins. Profile image is optional (max 5MB, jpg/jpeg/png).'
    })
    @ApiParam({ name: 'id', description: 'User ID', type: Number })
    @ApiBody({
        description: 'User update data with optional profile image',
        schema: {
            type: 'object',
            properties: {
                profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile image file (max 5MB, jpg/jpeg/png)'
                },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' },
                phone: { type: 'string', example: '+1234567890' },
                password: { type: 'string', example: 'newpassword123' },
                address: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' },
                latitude: { type: 'number', example: 40.7128 },
                longitude: { type: 'number', example: -74.006 }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully updated',
        type: User
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid data or ID'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - user with this ID does not exist'
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - email, username, or phone already exists'
    })
    async update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
        // Parse and validate the user ID
        const userId = (req as any)?.user.id;

        return this.usersService.update(userId, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Delete a user',
        description: 'Deletes a user. Only accessible by superadmins.'
    })
    @ApiParam({ name: 'id', description: 'User ID', type: Number })
    @ApiResponse({ status: 200, description: 'User successfully deleted' })
    @ApiResponse({ status: 400, description: 'Bad request - invalid user ID' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - user with this ID does not exist'
    })
    async remove(@Param('id') id: string) {
        // Parse and validate the user ID
        const userId = parseInt(id, 10);
        if (isNaN(userId) || userId <= 0) {
            throw new BadRequestException('Invalid user ID');
        }

        return this.usersService.remove(userId);
    }

    // Admin-specific endpoints

    @Patch(':id/verify-email')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN, RoleType.AGENT)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Verify user email',
        description:
            "Marks a user's email as verified. Only accessible by admins."
    })
    @ApiParam({ name: 'id', description: 'User ID', type: Number })
    @ApiResponse({
        status: 200,
        description: 'Email verification status updated',
        type: User
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - user with this ID does not exist'
    })
    verifyEmail(@Param('id') id: string) {
        return this.usersService.updateEmailVerificationStatus(+id, true);
    }

    @Patch(':id/verify-mobile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN, RoleType.AGENT)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Verify user mobile number',
        description:
            "Marks a user's mobile number as verified. Only accessible by admins."
    })
    @ApiParam({ name: 'id', description: 'User ID', type: Number })
    @ApiResponse({
        status: 200,
        description: 'Mobile verification status updated',
        type: User
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - user with this ID does not exist'
    })
    verifyMobile(@Param('id') id: string) {
        return this.usersService.updateMobileVerificationStatus(+id, true);
    }

    @Patch(':id/verify-kyc')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Verify user KYC',
        description:
            "Marks a user's KYC as verified. Only accessible by superadmins."
    })
    @ApiParam({ name: 'id', description: 'User ID', type: Number })
    @ApiResponse({
        status: 200,
        description: 'KYC verification status updated',
        type: User
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - user with this ID does not exist'
    })
    verifyKyc(@Param('id') id: string) {
        return this.usersService.updateKycVerificationStatus(+id, true);
    }
}
