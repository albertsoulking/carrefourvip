import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min
} from 'class-validator';

export class CreateUserDepositDto {
    @ApiProperty({ example: 50 })
    @IsNumber()
    @Min(10)
    amount: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    reference?: string;

    @ApiPropertyOptional({
        description: 'Payment gateway provider code for this deposit flow'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    payMethod?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    remark?: string;

    @ApiProperty({
        description: 'Uploaded proof file name (stored under uploads/images/)'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    proofImage: string;

    @ApiPropertyOptional({
        description: 'Full public URL to the proof image (optional if server can derive)'
    })
    @IsOptional()
    @IsString()
    @MaxLength(512)
    proofImageUrl?: string;
}
