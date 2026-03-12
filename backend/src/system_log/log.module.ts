import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { Log } from './entity/log.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { User } from 'src/users/entities/user.entity';
import { IpModule } from 'src/ip/ip.module';

@Module({
    imports: [TypeOrmModule.forFeature([Log, Admin, User]), IpModule],
    controllers: [LogController],
    providers: [LogService],
    exports: [LogService]
})
export class LogModule {}
