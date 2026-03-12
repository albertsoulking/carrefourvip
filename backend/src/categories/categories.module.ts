import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { AdminCategoryController } from './categories.admin.controller';
import { AdminCategoryService } from './categories.admin.service';
import { AdminModule } from 'src/admin/admin.module';
import { LogModule } from 'src/system_log/log.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Category]),
        AdminModule,
        LogModule,
        NotificationModule
    ],
    controllers: [CategoriesController, AdminCategoryController],
    providers: [CategoriesService, AdminCategoryService],
    exports: [CategoriesService, AdminCategoryService]
})
export class CategoriesModule {}
