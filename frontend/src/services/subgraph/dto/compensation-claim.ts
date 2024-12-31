
export interface CompensationClaim {
  id: string;
  claimer: string;
  arbiter: string;
  claimType: string;
  withdrawn: boolean;
  amount: string;
  evidence: string;
}