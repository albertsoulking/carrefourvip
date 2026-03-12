import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entity/setting.entity';
import { Repository } from 'typeorm';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Admin } from 'src/admin/entities/admin.entity';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { SearchSettingDto } from './dto/search-setting.dto';

@Injectable()
export class SettingAdminService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly logService: LogService
    ) {}

    async reset(adminId: number, req: Request, dto: UpdateSettingDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        let setting = await this.settingRepo.findOne({
            where: { group: dto.group, key: dto.key }
        });
        if (setting) Object.assign(setting, dto);
        else setting = this.settingRepo.create(dto);

        setting = await this.settingRepo.save(setting);
        await this.logService.logAdminAction(req, {
            adminId: admin.id,
            userType: UserType.ADMIN,
            action: '重置设置',
            targetType: '设置',
            targetId: setting.id,
            description: `[${admin.name}] 重置了设置: 组=${dto.group}, 键=${dto.key}, 值=${dto.value}。`
        });
    }

    async update(adminId: number, req: Request, dto: UpdateSettingDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const setting = await this.settingRepo.findOne({
            where: { group: dto.group, key: dto.key }
        });
        if (!setting) throw new NotFoundException('Invalid Settings!');

        await this.logService.logAdminAction(req, {
            adminId: admin.id,
            userType: UserType.ADMIN,
            action: '更新设置',
            targetType: '设置',
            targetId: setting.id,
            description: `[${admin.name}] 更新了设置: 组=${dto.group}, 键=${dto.key}, 值=${dto.value}。`
        });

        return await this.settingRepo.update(setting.id, dto);
    }

    async get(adminId: number, dto: SearchSettingDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const setting = await this.settingRepo.findOne({
            where: {
                key: dto.key,
                group: dto.group
            }
        });
        if (!setting) return {};

        return setting.value;
    }
}
