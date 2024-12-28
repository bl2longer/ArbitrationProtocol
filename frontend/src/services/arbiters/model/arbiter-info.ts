import { ArbiterInfo as ArbiterInfoDTO } from "@/services/subgraph/dto/arbiter-info";
import { tokenToReadableValue } from "@/services/tokens/tokens";
import BigNumber from "bignumber.js";
import { Expose, Transform, Type } from "class-transformer";
import moment, { Moment } from "moment";
import { zeroAddress } from "viem";
import { ContractArbiterInfo } from "../dto/contract-arbiter-info";

export type ArbiterStatus = "Active" | "Working" | "Paused" | "Terminated" | "Frozen";

export class ArbiterInfo implements Omit<ArbiterInfoDTO, "ethAmount" | "createdAt" | "currentFeeRate" | "pendingFeeRate"> {
  @Expose() public id: string;
  @Expose() public address: string;
  @Expose() @Transform(({ value }) => tokenToReadableValue(value, 18)) public ethAmount: BigNumber; // Number of native coins not including NFT values
  @Expose() @Transform(({ value }) => tokenToReadableValue(value, 18)) public nftValue: BigNumber; // Readable amount of native coin represented by the staked NFTs.
  @Expose() public status: ArbiterStatus;
  @Expose() @Transform(({ value }) => new Date(value * 1000)) public createdAt: Date;
  @Expose() public lastArbitrationTime: number;
  @Expose() @Type(() => Number) public currentFeeRate: number; // Fee rate with 100 basis. 100 means 1%
  @Expose() @Type(() => Number) public pendingFeeRate: number;
  @Expose() public activeTransactionId: string;
  @Expose() public operatorEvmAddress: string;
  @Expose() public operatorBtcAddress: string;
  @Expose() public operatorBtcPubKey: string;
  @Expose() public revenueEvmAddress: string;
  @Expose() public revenueBtcAddress: string;
  @Expose() public revenueBtcPubKey: string;

  public isActive(): boolean {
    return this.status === "Active";
  }

  public isPaused(): boolean {
    return this.status === "Paused";
  }

  public isWorking(): boolean {
    return this.status === "Working";
  }

  public getTermEndDate(): Moment {
    if (!this.lastArbitrationTime)
      return null;

    return moment.unix(this.lastArbitrationTime);
  }

  /**
   * Manual way of setting the NFT value which is automatically retrieved from the subgraph, but requires
   * an additional contract call when fetching arbiters directly from the contract.
   */
  public setNFTValue(value: BigNumber) {
    this.nftValue = value;
  }

  public getTotalValue(): BigNumber {
    return this.ethAmount.plus(this.nftValue || 0);
  }

  public static fromContractArbiterInfo(contractInfo: ContractArbiterInfo): ArbiterInfo {
    if (contractInfo?.arbitrator === zeroAddress)
      return undefined;

    const arbiter = new ArbiterInfo();

    arbiter.id = contractInfo.arbitrator;
    arbiter.address = contractInfo.arbitrator;
    arbiter.ethAmount = tokenToReadableValue(contractInfo.ethAmount, 18);
    arbiter.createdAt = null;
    arbiter.lastArbitrationTime = Number(contractInfo.deadLine);
    arbiter.currentFeeRate = Number(contractInfo.currentFeeRate);
    arbiter.activeTransactionId = contractInfo.activeTransactionId;
    arbiter.operatorEvmAddress = contractInfo.operator;
    arbiter.operatorBtcAddress = contractInfo.operatorBtcAddress;
    arbiter.operatorBtcPubKey = contractInfo.operatorBtcPubKey;
    arbiter.revenueEvmAddress = contractInfo.revenueETHAddress;
    arbiter.revenueBtcAddress = contractInfo.revenueBtcAddress;
    arbiter.revenueBtcPubKey = contractInfo.revenueBtcPubKey;

    switch (contractInfo.status) {
      case 0: arbiter.status = "Active"; break;
      case 1: arbiter.status = "Working"; break;
      case 2: arbiter.status = "Paused"; break;
      case 3: arbiter.status = "Terminated"; break;
      case 4: arbiter.status = "Frozen"; break;
    }

    return arbiter;
  }
}