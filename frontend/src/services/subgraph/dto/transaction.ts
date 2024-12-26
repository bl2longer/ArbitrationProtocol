
export interface Transaction {
  id: string;
  txId: string;
  dapp: string;
  arbiter: string;
  startTime: number;
  deadline: number;
  btcTx: string;
  btcTxHash: string;
  status: string;
  depositedFee: string;
  signature: string;
  compensationReceiver: string;
  timeoutCompensationReceiver: string;
}