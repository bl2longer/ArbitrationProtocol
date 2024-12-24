
export type VotesWithLockTime = {
  candidate: string;
  votes: bigint;
  lockTime: number;
}

export type BNFTVoteInfo = {
  transactionHash: string;
  blockHeight: number;
  voteType: number;
  infos: VotesWithLockTime[];
}
