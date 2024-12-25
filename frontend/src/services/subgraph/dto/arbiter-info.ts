
export interface ArbiterInfo {
  id: string;
  address: string; // same as id
  ethAmount: string;
  createdAt: number; // timestamp seconds
  lastArbitrationTime: number;
  currentFeeRate: string;
  pendingFeeRate: string;
  status: string; // TODO: enum
  activeTransactionId: string;

  // Operator
  operatorEvmAddress: string;
  operatorBtcAddress: string;
  operatorBtcPubKey: string;

  // Revenue
  revenueEvmAddress: string;
  revenueBtcAddress: string;
  revenueBtcPubKey: string;
}
