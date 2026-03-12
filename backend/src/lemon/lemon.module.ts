import { Module } from "@nestjs/common";
import { LemonService } from "./lemon.service";
import { LemonController } from "./lemon.controller";

@Module({
    controllers: [LemonController],
    providers: [LemonService],
    exports: [LemonService]
})

export class LemonModule {}
