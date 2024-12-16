export interface ArbitratorInfo {
  address: string;
  info: {
    operator: string;
    btcPubKey: string;
    btcAddress: string;
    feeRate: bigint;
    termDuration: bigint;
  };
  isPaused: boolean;
  stake: string;
}
