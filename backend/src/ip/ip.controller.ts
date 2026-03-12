import { Controller, Post, Req } from "@nestjs/common";
import { IpService } from "./ip.service";
import { Request } from "express";

@Controller('ip')
export class IpController {
    constructor(private readonly ipService: IpService) {}

    @Post('get-ip')
    getIp(@Req() req: Request) {
        return this.ipService.getGeoInfoByIp(req);
    }
}