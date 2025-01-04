
export interface CompensationClaim {
  id: string;
  createdAt: number;
  claimer: string;
  arbiter: string;
  claimType: string;
  withdrawn: boolean;
  ethAmount: string;
  totalAmount: string;
  receivedCompensationAddress: string;
  systemFee: string;
  excessPaymentToClaimer: string;
}