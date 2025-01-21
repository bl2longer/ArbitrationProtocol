import { Controller } from '@nestjs/common';
import { TransactionHandlerService } from './transaction-handler.service';

@Controller('transaction-handler')
export class TransactionHandlerController {
  constructor(private readonly transactionHandlerService: TransactionHandlerService) {}
}
