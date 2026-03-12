import {
    Body,
    Controller,
    Post
} from '@nestjs/common';
import { SettingService } from './setting.service';
import { ApiTags } from '@nestjs/swagger';
import { SearchSettingDto } from './dto/search-setting.dto';

@ApiTags('settings')
@Controller('settings')
export class SettingController {
    constructor(private readonly settingService: SettingService) {}

    @Post('get-setting')
    queryOne(@Body() dto: SearchSettingDto) {
        return this.settingService.getOne(dto);
    }
}
