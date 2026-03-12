import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './2fa.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('two-factor')
export class TwoFactorAuthenticationController {
    constructor(
        private readonly twoFactorService: TwoFactorAuthenticationService
    ) {}

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Post('verify-admin')
    verifyAdmin(@Req() req: Request, @Body('password') password: string) {
        const adminId = (req as any)?.user.id;
        return this.twoFactorService.verifyAdmin(adminId, password);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Post('generate-2fa-secret')
    generate2FASecret(@Req() req: Request) {
        const adminId = (req as any)?.user.id;
        return this.twoFactorService.generate2FASecret(adminId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Post('verify-2fa')
    verfiy2FACode(@Req() req: Request, @Body('token') token: string) {
        const adminId = (req as any)?.user.id;
        return this.twoFactorService.verify2FACode(adminId, token);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Post('remove-2fa')
    remove2FAVerification(@Req() req: Request, @Body('token') token: string) {
        const adminId = (req as any)?.user.id;
        return this.twoFactorService.remove2FAVerification(adminId, token);
    }

    @Post('send-email')
    sendEmail(@Body('email') email: string) {
        return this.twoFactorService.sendEmailCode(email);
    }

    @Post('verify-email')
    verifyEmail(@Body('email') email: string, @Body('code') code: string) {
        return this.twoFactorService.verifyEmailCode(email, code);
    }
}
