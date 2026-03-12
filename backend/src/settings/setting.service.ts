import {
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entity/setting.entity';
import { Repository } from 'typeorm';
import { SearchSettingDto } from './dto/search-setting.dto';

@Injectable()
export class SettingService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>
    ) {}

    async getOne(dto: SearchSettingDto) {
        const setting = await this.settingRepo.findOne({
            where: dto
        });
        if (!setting) {
            throw new NotFoundException(`Setting ${dto.key}-${dto.group} not found`);
        }

        return setting.value;
    }
}
