import { Expose } from "class-transformer";
import { BNFTVoteInfo as BNFTVoteInfoDTO, VotesWithLockTime as VotesWithLockTimeDTO } from "../dto/nft-info";

export class VotesWithLockTime implements VotesWithLockTimeDTO {
  @Expose() public candidate: string;
  @Expose() public votes: bigint;
  @Expose() public lockTime: number;
}

export class BNFTVoteInfo implements BNFTVoteInfoDTO {
  @Expose() public transactionHash: string;
  @Expose() public blockHeight: number;
  @Expose() public voteType: number;
  @Expose() public infos: VotesWithLockTime[];

  /**
   * Returns the native coin value of the NFT based on the number of votes.
   */
  public getCoinValue(): number {
    return 1;
  }
}