import { Transaction as TransactionDTO } from "@/services/subgraph/dto/transaction";
import { Expose } from "class-transformer";

export class Transaction implements TransactionDTO {
  @Expose() public id: string;
  @Expose() public txId: string;
  @Expose() public dapp: string;
  @Expose() public arbitrator: string;
  @Expose() public status: string;
  @Expose() public startTime: string;
  @Expose() public deadline: string;
  @Expose() public btcTx: string;
  @Expose() public btcTxHash: string;
  @Expose() public depositedFee: string;
  @Expose() public signature: string;
  @Expose() public compensationReceiver: string;
  @Expose() public timeoutCompensationReceiver: string;
}