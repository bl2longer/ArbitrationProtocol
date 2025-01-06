import { Transaction } from "bitcoinjs-lib";
import { getTransactionDetails } from "../nownodes-api/nownodes-api";

export type ParamsForZKPRequest = {
  utxos: string[];
}

/**
 * Retrieves and returns all info needed to be able to submit a proof to tke ZKP service.
 * The required information is mostly found on bitcoin chain block/transaction/utxos.
 *
 * NOTE: the merkle proof is an array, one entry for each node of the tree that must be traversed between a leaf and the root (the path).
 */
export const getParamsForZKPRequest = async (rawBtcTx: string): Promise<ParamsForZKPRequest> => {
  console.log("Building ZKP fill order proof parameters");

  if (!rawBtcTx)
    throw new Error("getParamsForZKPRequest(): rawBtcTx cannot be empty");

  const bitcoinTransaction = Transaction.fromHex(rawBtcTx);

  // TBD: Apparently, the utxos array is composed of the raw transaction data (not byte reversed) of every parent transaction in "vin"
  const utxos: string[] = [];
  for (const vin of bitcoinTransaction.ins) {
    const txId = Buffer.from(vin.hash).reverse().toString('hex');
    const txData = await getTransactionDetails(txId);
    if (!txData || !txData.hex) {
      console.error("getTransactionDetails error:", txData);
      return null;
    }

    console.log("txData", txData)
    utxos.push(txData.hex);
  }

  return {
    utxos
  };
}