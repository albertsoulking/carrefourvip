import { IsNumber, IsString, IsPositive, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Order Id',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  orderId: number

  @ApiProperty({
    description: 'Unique transaction number',
    example: 'TXN-123456789',
  })
  @IsNotEmpty()
  @IsString()
  transactionNumber: string;

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
