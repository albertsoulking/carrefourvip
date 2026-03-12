import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/products.entity';
import { ProductsController } from './products.controller';
import { ProductService } from './products.service';
import { AdminProductsController } from './products.admin.controller';
import { AdminProductsService } from './prodcuts.admin.service';
import { AdminModule } from 'src/admin/admin.module';
import { RoleMenuModule } from 'src/role/role_menu.module';
import { UtilityModule } from 'src/utility/utility.module';
import { LogModule } from 'src/system_log/log.module';
import { IpModule } from 'src/ip/ip.module';
import { ExchangeRate } from 'src/exchange/entity/exchange.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product, ExchangeRate]),
        AdminModule,
        RoleMenuModule,
        UtilityModule,
        LogModule,
        IpModule,
        NotificationModule
    ],
    controllers: [ProductsController, AdminProductsController],
    providers: [ProductService, AdminProductsService],
    exports: [ProductService, AdminProductsService, TypeOrmModule]
})
export class ProductsModule {}
