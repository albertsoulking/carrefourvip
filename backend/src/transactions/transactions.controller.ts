import {
    Controller,
    UseGuards,
    HttpStatus,
    Req,
    Post,
    Body,
    Get,
    Param,
    ParseIntPipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { Request } from 'express';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateUserDepositDto } from './dto/create-user-deposit.dto';

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Post('get-my-transactions')
    @ApiOperation({
        summary: 'Get all transactions for the authenticated user'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns all transactions',
        type: [Transaction]
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User not authenticated'
    })
    async findMyTransactions(
        @Req() req: Request,
        @Body('page') page: number,
        @Body('limit') limit: number,
        @Body('type') type: number
    ) {
        const userId = (req as any)?.user?.id;
        return this.transactionsService.findMyTransactions(
            userId,
            page,
            limit,
            type
        );
    }

    @Post('create-deposit')
    @ApiOperation({ summary: 'Create a pending bank deposit (no balance change)' })
    @ApiResponse({ status: HttpStatus.CREATED, type: Transaction })
    async createDeposit(
        @Req() req: Request,
        @Body() body: CreateUserDepositDto
    ) {
        const userId = (req as any)?.user?.id;
        return this.transactionsService.createUserDeposit(userId, body);
    }

    @Get('mine/:id')
    @ApiOperation({ summary: 'Get one transaction for the current user' })
    @ApiResponse({ status: HttpStatus.OK, type: Transaction })
    async getOneMine(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number
    ) {
        const userId = (req as any)?.user?.id;
        return this.transactionsService.findOneMine(userId, id);
    }

    @Post('update-one-transaction')
    updateOneTransaction(@Body() body: UpdateTransactionDto) {
        return this.transactionsService.updateOneTransaction(body);
    }
}
