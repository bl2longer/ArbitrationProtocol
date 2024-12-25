
export interface CompensationClaim {
  id: string;
  dapp: string;
  arbiter: string;
  ethAmount: string;
  nftContract: string;
  nftTokenIds: string[];
  totalAmount: string;
  withdrawn: boolean;
  claimType: string;
}