import { IsEnum, IsNumber } from "class-validator";
import { TransactionStatus } from "../enum/transactions.enum";

export class UpdateTransactionDto {
    @IsNumber()
    id: number;

    @IsEnum(TransactionStatus)
    status: TransactionStatus;
}
