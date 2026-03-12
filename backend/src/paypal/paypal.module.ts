import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from 'src/settings/entity/setting.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Setting, User])],
    controllers: [PaypalController],
    providers: [PaypalService]
})
export class PaypalModule {}
