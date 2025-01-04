import { CompensationClaim as CompensationClaimDTO } from "@/services/subgraph/dto/compensation-claim";
import { tokenToReadableValue } from "@/services/tokens/tokens";
import { Expose, Transform } from "class-transformer";

export type CompensationType = "IllegalSignature" | "Timeout" | "FailedArbitration" | "ArbitratorFee";

export class CompensationClaim implements Omit<CompensationClaimDTO, "ethAmount" | "createdAt" | "systemFee" | "totalAmount"> {
  @Expose() public id: string;
  @Expose() public claimer: string;
  @Expose() public arbiter: string;
  @Expose() public claimType: CompensationType;
  @Expose() public withdrawn: boolean;
  @Expose() @Transform(({ value }) => tokenToReadableValue(value, 18)) public ethAmount: bigint;
  @Expose() @Transform(({ value }) => tokenToReadableValue(value, 18)) public systemFee: bigint;
  @Expose() @Transform(({ value }) => tokenToReadableValue(value, 18)) public totalAmount: bigint;
  @Expose() public excessPaymentToClaimer: string;
  @Expose() public receivedCompensationAddress: string;
}