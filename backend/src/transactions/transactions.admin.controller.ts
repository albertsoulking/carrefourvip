import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AdminTransactionService } from './transactions.admin.service';
import { Request } from 'express';
import { SearchTransactionDto } from './dto/search-transaction.dto';
import { ApproveDepositDto } from './dto/approve-deposit.dto';
import { RejectDepositDto } from './dto/reject-deposit.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('admin/transactions')
@Controller('admin/transactions')
export class AdminTransactionController {
    constructor(private adminTransactionService: AdminTransactionService) {}

    @Post('get-all-transactions')
    getTransactions(@Req() req: Request, @Body() dto: SearchTransactionDto) {
        const adminId = (req as any)?.user.id;
        return this.adminTransactionService.getTransactions(adminId, dto);
    }

    @Post('approve-bank-deposit')
    approveBankDeposit(
        @Req() req: Request,
        @Body() body: ApproveDepositDto
    ) {
        const adminId = (req as any)?.user.id;
        return this.adminTransactionService.approveBankDeposit(
            adminId,
            body.id
        );
    }

    @Post('reject-bank-deposit')
    rejectBankDeposit(
        @Req() req: Request,
        @Body() body: RejectDepositDto
    ) {
        const adminId = (req as any)?.user.id;
        return this.adminTransactionService.rejectBankDeposit(
            adminId,
            body.id,
            body.reason
        );
    }

    @Post('adjust-balance')
    adjustBalance(@Req() req: Request, @Body() body: AdjustBalanceDto) {
        const adminId = (req as any)?.user.id;
        return this.adminTransactionService.adjustBalance(adminId, body);
    }
}
