
export interface Transaction {
  id: string;
  txId: string;
  dapp: string;
  arbitrator: string;
  startTime: string;
  deadline: string;
  btcTx: string;
  btcTxHash: string;
  status: string;
  depositedFee: string;
  signature: string;
  compensationReceiver: string;
  timeoutCompensationReceiver: string;
}