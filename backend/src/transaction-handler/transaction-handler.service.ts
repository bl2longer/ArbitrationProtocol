import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Transaction } from 'src/transactions/model/transaction';
import { TransactionsService } from 'src/transactions/transactions.service';

const FetchTransactionsIntervalSec = 30;

@Injectable()
export class TransactionHandlerService implements OnModuleInit {
  private logger = new Logger("TransactionHandler");

  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService
  ) { }

  onModuleInit() {
    void this.launchBackgroundProcessing();
  }

  private launchBackgroundProcessing() {
    this.logger.log("Launch background processing");

    void this.getAndProcessRecentTransactions();
  }

  private async getAndProcessRecentTransactions() {
    const { transactions } = await this.transactionsService.fetchTransactions(0, 100);
    this.logger.log(`Fetched ${transactions.length} recent transactions`);

    for (const tx of transactions) {
      await this.checkTransaction(tx);
    }

    setTimeout(() => {
      void this.getAndProcessRecentTransactions();
    }, FetchTransactionsIntervalSec * 1000);
  }

  private async checkTransaction(transaction: Transaction) {
    // Skip transaction if it doesn't have an arbitration request
    if (!transaction.requestArbitrationTime)
      return;

    // Find if we already have a matching arbitration request DB entry
    const arbitrationRequest = await this.prisma.arbitrationRequest.findFirst({
      where: {
        requestArbitrationTime: transaction.requestArbitrationTime.toDate()
      }
    });

    if (arbitrationRequest)
      return;

    // Retrieve the transaction arbiter. Arbiter must have registered an email address into this service first.
    const arbiter = await this.prisma.arbiter.findFirst({
      where: {
        ownerEvmAddress: transaction.arbiter
      }
    });

    this.logger.log(`Transaction ${transaction.txId} (that has an arbitration request) not yet in DB, saving`);
    await this.prisma.arbitrationRequest.create({
      data: {
        transactionId: transaction.txId,
        requestArbitrationTime: transaction.requestArbitrationTime.toDate(),
        deadline: transaction.deadline.toDate(),
        ...(arbiter && { arbiterId: arbiter.id }),
      }
    });

    // Send email to arbiter owner
    if (arbiter && arbiter.email) {
      this.logger.log(`Sending arbitration request email to arbiter owner ${arbiter.ownerEvmAddress} / ${arbiter.email} for transaction id ${transaction.txId}`);
      // TODO: Send email, mark as sent, check if email was sent
    }
  }
}