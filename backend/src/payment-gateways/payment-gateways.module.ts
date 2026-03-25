import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGatewayAdminService } from './payment-gateways.admin.service';
import { PaymentGatewayAdminController } from './payment-gateways.admin.controller';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { LogModule } from 'src/system_log/log.module';
import { User } from 'src/users/entities/user.entity';
import { PaymentGatewayController } from './payment-gateway.controller';
import { PaymentGatewayService } from './payment-gateway.service';
import { AdminModule } from 'src/admin/admin.module';
import { PaymentProvider } from './entities/payment-provider.entity';
import { PaymentProviderAdminService } from './payment-provider.admin.service';
import { PaymentProviderAdminController } from './payment-provider.admin.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PaymentGateway,
            Admin,
            User,
            PaymentProvider
        ]),
        LogModule,
        forwardRef(() => AdminModule)
    ],
    controllers: [
        PaymentGatewayAdminController,
        PaymentGatewayController,
        PaymentProviderAdminController
    ],
    providers: [
        PaymentGatewayAdminService,
        PaymentGatewayService,
        PaymentProviderAdminService
    ],
    exports: [
        PaymentGatewayAdminService,
        PaymentGatewayService,
        PaymentProviderAdminService
    ]
})
export class PaymentGatewaysModule {}
