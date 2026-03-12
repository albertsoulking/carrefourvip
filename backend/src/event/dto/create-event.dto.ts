import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';
import { EventTemplate, EventType } from '../enum/event.enum';
import { Type } from 'class-transformer';

export class CreateEventDto {
    @IsEnum(EventTemplate)
    @IsNotEmpty()
    template: EventTemplate;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(EventType)
    @IsNotEmpty()
    type: EventType;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    startDate: Date;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    endDate?: Date;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsNumber()
    @IsNotEmpty()
    luckyWheelId: number;
}
