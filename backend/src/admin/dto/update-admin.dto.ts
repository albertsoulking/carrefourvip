import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { RoleType } from 'src/role/enum/role.enum';

export class UpdateAdminDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsBoolean()
    status?: boolean;

    @IsOptional()
    @IsString()
    referralCode?: string;

    @IsOptional()
    @IsString()
    remark?: string;
    
    @IsOptional()
    @IsNumber()
    parentId?: number;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEnum(RoleType)
    roleName?: RoleType;
}
