import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpController } from './ip.controller';
import { IpService } from './ip.service';
import { Ip } from './entity/ip.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Ip])],
    controllers: [IpController],
    providers: [IpService],
    exports: [IpService]
})
export class IpModule {}
