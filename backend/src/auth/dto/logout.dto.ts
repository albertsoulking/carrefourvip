import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { UserType } from 'src/login-activities/enum/login-activities.enum';

export class LogoutDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsEnum(UserType)
    @IsNotEmpty()
    userType: UserType;
}
