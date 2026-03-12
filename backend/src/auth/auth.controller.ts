import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { LogoutDto } from './dto/logout.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('admin/login')
    @ApiOperation({ summary: 'Admin login with credentials and get JWT token' })
    @ApiResponse({
        status: 200,
        description: 'Returns JWT access token and admin info'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid credentials'
    })
    async adminLogin(@Body() loginDto: LoginDto, @Req() req: Request) {
        return this.authService.adminLogin(
            loginDto,
            req
        );
    }

    @Post('user/login')
    @ApiOperation({ summary: 'User login with credentials and get JWT token' })
    @ApiResponse({
        status: 200,
        description: 'Returns JWT access token and user info'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid credentials'
    })
    async userLogin(@Body() loginDto: LoginDto, @Req() req: Request) {
        return this.authService.userLogin(
            loginDto,
            req
        );
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout and invalidate JWT token' })
    @ApiResponse({ status: 200, description: 'Successfully logged out' })
    async logout(@Req() req: Request, @Body() dto: LogoutDto) {
        return this.authService.logout(dto, req);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Change password for the current user' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiResponse({
        status: 400,
        description: 'Invalid request or old password incorrect'
    })
    async changePassword(
        @Req() req: Request,
        @Body()
        body: { oldPassword: string; newPassword: string; userType: UserType }
    ) {
        const userId = (req as any)?.user?.id;
        return this.authService.changePassword(
            userId,
            body?.oldPassword,
            body?.newPassword,
            body?.userType
        );
    }
}
