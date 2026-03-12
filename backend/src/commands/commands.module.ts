import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { CreateAdminCommand } from './create-admin.command';
import { databaseConfig } from '../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AdminModule
  ],
  providers: [CreateAdminCommand],
  exports: [CreateAdminCommand],
})
export class CommandsModule {}
