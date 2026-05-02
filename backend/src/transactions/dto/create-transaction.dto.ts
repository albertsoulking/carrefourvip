import { IsNumber, IsString, IsPositive, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Order Id',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  orderId: number

  @ApiPropertyOptional({
    description: 'Unique transaction number (auto-generated if omitted)',
    example: 'TXN-123456789',
  })
  @IsOptional()
  @IsString()
  transactionNumber?: string;

  @ApiProperty({
    description: 'ID of the user associated with the transaction',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  userId: number;

  @ApiProperty({
    description: 'Transaction amount',
    example: '100.50',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;
}
