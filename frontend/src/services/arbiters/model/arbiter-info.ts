import { ArbiterInfo as ArbiterInfoDTO } from "@/services/subgraph/dto/arbiter-info";
import { tokenToReadableValue } from "@/services/tokens/tokens";
import { Expose, Transform } from "class-transformer";
import moment, { Moment } from "moment";

export class ArbiterInfo implements Omit<ArbiterInfoDTO, "ethAmount" | "createdAt"> {
  @Expose() public id: string;
  @Expose() public address: string;
  @Expose() @Transform(({ value }) => tokenToReadableValue(value, 18)) public ethAmount: bigint;
  @Expose() public status: string;
  @Expose() @Transform(({ value }) => new Date(value * 1000)) public createdAt: Date;
  @Expose() public lastArbitrationTime: number;
  @Expose() public currentFeeRate: number;
  @Expose() public pendingFeeRate: number;
  @Expose() public activeTransactionId: string;
  @Expose() public operatorEvmAddress: string;
  @Expose() public operatorBtcAddress: string;
  @Expose() public operatorBtcPubKey: string;
  @Expose() public revenueEvmAddress: string;
  @Expose() public revenueBtcAddress: string;
  @Expose() public revenueBtcPubKey: string;

  public isPaused(): boolean {
    return this.status === "Paused"; // TODO: improve with enum
  }

  public getTermEndDate(): Moment {
    if (!this.lastArbitrationTime)
      return null;

    return moment.unix(this.lastArbitrationTime);
  }
}