import { Module } from '@nestjs/common';
import { TransactionHandlerService } from './transaction-handler.service';
import { TransactionHandlerController } from './transaction-handler.controller';

@Module({
  controllers: [TransactionHandlerController],
  providers: [TransactionHandlerService],
})
export class TransactionHandlerModule {}
