import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { TransactionHandlerService } from './transaction-handler.service';

@Module({
  providers: [
    TransactionHandlerService
  ],
  imports: [
    TransactionsModule,
    PrismaModule
  ]
})
export class TransactionHandlerModule { }
