import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString
} from 'class-validator';
import { UserMode } from 'src/users/enum/user.enum';
import { TicketStatus } from '../enum/tickets.enum';
import { Type } from 'class-transformer';

export class SearchTicketDto {
    @IsNumberString()
    @IsOptional()
    ticketId?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    subject?: string;

    @IsEnum(UserMode)
    @IsOptional()
    mode?: UserMode;

    @IsNumber()
    @IsOptional()
    parentId?: number;

    @IsEnum(TicketStatus)
    @IsOptional()
    status?: TicketStatus;

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
