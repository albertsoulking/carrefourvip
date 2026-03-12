import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExchangeRateController } from "./exchange.controller";
import { ExchangeRateService } from "./exchange.service";
import { ExchangeRate } from "./entity/exchange.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ExchangeRate])],
    controllers: [ExchangeRateController],
    providers: [ExchangeRateService],
    exports: [ExchangeRateService]
})
export class ExchangeRateModule {}
