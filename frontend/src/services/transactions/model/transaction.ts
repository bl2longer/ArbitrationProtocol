import { Transaction as TransactionDTO } from "@/services/subgraph/dto/transaction";
import { tokenToReadableValue } from "@/services/tokens/tokens";
import BigNumber from "bignumber.js";
import { Expose, Transform } from "class-transformer";

export type TransactionStatus = "Unknown" | "Active" | "Completed" | "Arbitrated" | "Expired" | "Disputed" | "Submitted";

export class Transaction implements Omit<TransactionDTO, "startTime" | "deadline" | "depositedFee"> {
  @Expose() public id: string;
  @Expose() public txId: string;
  @Expose() public dapp: string;
  @Expose() public arbiter: string;
  @Expose() public status: TransactionStatus;
  @Expose() @Transform(({ value }) => value && new Date(value * 1000)) public startTime: Date;
  @Expose() @Transform(({ value }) => value && new Date(value * 1000)) public deadline: Date;
  @Expose() public btcTx: string;
  @Expose() public btcTxHash: string;
  @Expose() @Transform(({ value }) => value && tokenToReadableValue(value, 18)) public depositedFee: BigNumber;
  @Expose() public signature: string;
  @Expose() public compensationReceiver: string;
  @Expose() public timeoutCompensationReceiver: string;
}