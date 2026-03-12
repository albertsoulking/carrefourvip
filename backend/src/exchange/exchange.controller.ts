import { Controller } from "@nestjs/common";
import { ExchangeRateService } from "./exchange.service";

@Controller('exchange-rate')
export class ExchangeRateController {
    constructor(private readonly exService: ExchangeRateService) {}
}
