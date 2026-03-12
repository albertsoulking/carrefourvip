import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';
import { NotificationType } from '../enum/notification.enum';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsEnum(NotificationType)
    @IsNotEmpty()
    type: NotificationType;

    @IsString()
    @IsNotEmpty()
    path: string;

    @IsDate()
    @IsNotEmpty()
    createdAt: Date;

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    targetId: number;

    @IsEnum(UserType)
    @IsNotEmpty()
    userType: UserType;

    @IsNumber()
    @IsNotEmpty()
    enableNoti: number;

    @IsString()
    @IsOptional()
    extra?: string;
}
