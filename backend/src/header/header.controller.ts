import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { HeaderService } from "./header.service";
import { Request } from "express";

@Controller('/')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class HeaderController  {
    constructor(private readonly headerService: HeaderService) {}

    @Post('get-header-status')
    getHeaderStatus(@Req() req: Request) {
        const userId = (req as any)?.user.id;
        return this.headerService.getHeaderStatus(userId);
    }
}