import { Module } from "@nestjs/common";
import { StarPayService } from "./star_pay.service";
import { StarPayController } from "./star_pay.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "src/orders/entities/order.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Order])],
    controllers: [StarPayController],
    providers: [StarPayService],
    exports: [StarPayService]
})
export class StarPayModule {}