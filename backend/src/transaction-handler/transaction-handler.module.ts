import { Module } from '@nestjs/common';
import { EmailingModule } from 'src/emailing/emailing.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { TransactionHandlerService } from './transaction-handler.service';

@Module({
  providers: [
    TransactionHandlerService
  ],
  imports: [
    TransactionsModule,
    PrismaModule,
    EmailingModule
  ]
})
export class TransactionHandlerModule { }
