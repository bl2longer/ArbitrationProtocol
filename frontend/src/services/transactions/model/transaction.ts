import { Transaction as TransactionDTO } from "@/services/subgraph/dto/transaction";
import { tokenToReadableValue } from "@/services/tokens/tokens";
import BigNumber from "bignumber.js";
import { Expose, Transform } from "class-transformer";
import moment, { Moment } from "moment";
import { zeroAddress } from "viem";
import { ContractTransaction, UTXO } from "../dto/contract-transaction";

export type TransactionStatus = "Unknown" | "Active" | "Completed" | "Arbitrated" | "Expired" | "Disputed" | "Submitted";

export class Transaction implements Omit<TransactionDTO, "startTime" | "deadline" | "depositedFee" | "requestArbitrationTime"> {
  @Expose() public id: string;
  @Expose() public txId: string;
  @Expose() public dapp: string;
  @Expose() public arbiter: string;
  @Expose() public status: TransactionStatus;
  @Expose() @Transform(({ value }) => value && moment.unix(value)) public startTime: Moment;
  @Expose() @Transform(({ value }) => value && moment.unix(value)) public deadline: Moment;
  @Expose() public btcTx: string;
  @Expose() public btcTxHash: string;
  @Expose() @Transform(({ value }) => value && tokenToReadableValue(value, 18)) public depositedFee: BigNumber;
  @Expose() public signature: string;
  @Expose() public compensationReceiver: string;
  @Expose() public timeoutCompensationReceiver: string;
  @Expose() public utxos: UTXO[];
  @Expose() public script: string;
  @Expose() @Transform(({ value }) => value && moment.unix(value)) public requestArbitrationTime: Moment;

  public static fromContractTransaction(contractTransaction: ContractTransaction): Transaction {
    if (contractTransaction?.dapp === zeroAddress)
      return undefined;

    const transaction = new Transaction();

    transaction.id = contractTransaction.arbitrator;
    transaction.btcTx = contractTransaction.btcTx;
    transaction.btcTxHash = contractTransaction.btcTxHash;
    transaction.compensationReceiver = contractTransaction.compensationReceiver;
    transaction.timeoutCompensationReceiver = contractTransaction.timeoutCompensationReceiver;
    transaction.utxos = contractTransaction.utxos;
    transaction.script = contractTransaction.script;
    transaction.signature = contractTransaction.signature;
    transaction.dapp = contractTransaction.dapp;
    transaction.arbiter = contractTransaction.arbitrator;
    transaction.startTime = moment.unix(parseInt(contractTransaction.startTime));
    transaction.deadline = moment.unix(parseInt(contractTransaction.deadline));
    transaction.depositedFee = new BigNumber(contractTransaction.depositedFee);
    // TODO transaction.status = contractTransaction.status;

    return transaction;
  }
}