
export interface CompensationClaim {
  id: string;
  dapp: string;
  arbitrator: string;
  ethAmount: string;
  nftContract: string;
  nftTokenIds: string[];
  totalAmount: string;
  withdrawn: boolean;
  claimType: string;
}