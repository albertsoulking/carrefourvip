import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString
} from 'class-validator';
import { EventTemplate, EventType } from '../enum/event.enum';
import { Type } from 'class-transformer';

export class SearchEventDto {
    @IsNumberString()
    @IsOptional()
    eventId?: number;

    @IsEnum(EventTemplate)
    @IsOptional()
    template?: EventTemplate;

    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(EventType)
    @IsOptional()
    type?: EventType;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    fromDate?: Date;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    toDate?: Date;

    @IsNumber()
    @IsNotEmpty()
    page: number;

    @IsNumber()
    @IsNotEmpty()
    limit: number;

    @IsString()
    @IsNotEmpty()
    orderBy: string;

    @IsString()
    @IsNotEmpty()
    sortBy: string;
}
