import { CompensationClaim as CompensationClaimDTO } from "@/services/subgraph/dto/compensation-claim";
import { tokenToReadableValue } from "@/services/tokens/tokens";
import { Expose, Transform } from "class-transformer";

export class CompensationClaim implements Omit<CompensationClaimDTO, "ethAmount" | "createdAt"> {
  @Expose() public id: string;
  @Expose() public dapp: string;
  @Expose() public arbiter: string;
  @Expose() @Transform(({ value }) => tokenToReadableValue(value, 18)) public amount: bigint;
  @Expose() public nftContract: string;
  @Expose() public nftTokenIds: string[];
  @Expose() public totalAmount: string;
  @Expose() public withdrawn: boolean;
  @Expose() public claimType: string;
}