import { CompensationClaim as CompensationClaimDTO } from "@/services/subgraph/dto/compensation-claim";
import { tokenToReadableValue } from "@/services/tokens/tokens";
import { Expose, Transform } from "class-transformer";

export type CompensationType = "IllegalSignature" | "Timeout" | "FailedArbitration" | "ArbitratorFee";

export class CompensationClaim implements Omit<CompensationClaimDTO, "amount" | "createdAt"> {
  @Expose() public id: string;
  @Expose() public claimer: string;
  @Expose() public arbiter: string;
  @Expose() public claimType: CompensationType;
  @Expose() public withdrawn: boolean;
  @Expose() @Transform(({ value }) => tokenToReadableValue(value, 18)) public amount: bigint;
  @Expose() public evidence: string;
}