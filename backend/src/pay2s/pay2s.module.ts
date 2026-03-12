import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pay2sController } from './pay2s.controller';
import { Pay2sService } from './pay2s.service';
import { Setting } from 'src/settings/entity/setting.entity';
import { OrdersModule } from 'src/orders/orders.module';
import { Order } from 'src/orders/entities/order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Setting, Order]), OrdersModule],
    controllers: [Pay2sController],
    providers: [Pay2sService],
    exports: [Pay2sService]
})
export class Pay2sModule {}
