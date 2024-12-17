
export interface ArbitratorInfo {
  id: string;
  address: string; // same as id
  ethAmount: string;
  createdAt: number; // timestamp seconds
  lastArbitrationTime: number;
  currentFeeRate: number;
  pendingFeeRate: number;
  status: string; // TODO: enum
  activeTransactionId: string;
  operatorEvmAddress: string;
  operatorBtcAddress: string;
  operatorBtcPubKey: string;
}
