import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Ip } from './entity/ip.entity';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class IpService {
    constructor(
        @InjectRepository(Ip)
        private readonly ipRepo: Repository<Ip>
    ) {}

    async getGeoInfoByIp(req: Request) {
        const ip = await this.getClientIp(req);
        let geoInfo: any = null;

        if (ip === '::1' || ip === '127.0.0.1') return { ip };

        try {
            geoInfo = await this.ipRepo.findOneBy({ ip });

            if (!geoInfo) {
                geoInfo = await axios
                    .get(`https://ipapi.co/${ip}/json/`)
                    .then((res) => res.data);

                // UPSERT 防止重复插入
                await this.ipRepo.upsert(
                    { ip, ...geoInfo }, // 插入的值
                    ['ip'] // 唯一键字段
                );
                // 再查一次确保取到数据库中的数据
                geoInfo = await this.ipRepo.findOneBy({ ip });
            }

            return geoInfo;
        } catch (error) {
            console.error(error);
            return geoInfo;
        }
    }

    async getClientIp(req?: Request | any): Promise<string> {
        // 如果没有 req，返回本地回环 IP
        if (!req || typeof req !== 'object') {
            return '127.0.0.1';
        }

        try {
            const xForwardedFor = req.headers?.['x-forwarded-for'];

            if (typeof xForwardedFor === 'string') {
                return xForwardedFor.split(',')[0].trim();
            } else if (
                Array.isArray(xForwardedFor) &&
                xForwardedFor.length > 0
            ) {
                return xForwardedFor[0].split(',')[0].trim();
            }

            return req.socket?.remoteAddress || '127.0.0.1';
        } catch (e) {
            // 兜底，防止任何意外
            return '127.0.0.1';
        }
    }
}
