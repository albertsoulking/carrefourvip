import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class UpdateOrderPaymentProofDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    orderId: number;

    @ApiProperty({ description: 'Uploaded file name under uploads/images/' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    paymentProofImage: string;
}
