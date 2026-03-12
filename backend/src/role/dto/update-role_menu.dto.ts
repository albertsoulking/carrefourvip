import { IsArray, IsInt, IsNumber, IsPositive } from 'class-validator';

export class UpdateRoleMenusDto {
    @IsNumber()
    @IsPositive()
    id: number;

    @IsArray()
    @IsInt({ each: true })
    menuIds: number[];

    @IsArray()
    @IsInt({ each: true })
    permissionIds: number[];
}
