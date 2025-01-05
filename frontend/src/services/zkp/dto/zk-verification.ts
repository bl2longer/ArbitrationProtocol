import { UTXO } from "@/services/transactions/dto/contract-transaction";

export type ZKVerification = {
  status: bigint;
  pubKey: string;
  txHash: string;
  signature: string;
  verified: boolean;
  utxos: UTXO[];
}