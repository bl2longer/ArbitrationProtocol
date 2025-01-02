const zkpServiceUrl = "http://103.1.65.125:8018";

/**
 * Requests the ZKP service to generate a proof for a given bitcoin transaction.
 * This is used for example when a user considers an arbiter has submitted a malicious bitcoin transaction. In 
 * this case, user submits the wrong transaction hash and this transaction gets verified.
 * 
 * This operation takes time on the zkp service side, so an id is first returned and later used to check the on going status.
 */
export const requestZKPVerification = (btcTxHash: string) => {
  const endpoint = `${zkpServiceUrl}/prove`;

  // TBD: apparently this is going to be replaced by a contract call. Don't implement this for now.

  // The return value is the id for the signature verification of this transaction, which can be used to submit to the contract
  //     POST 请求 Json：
  //     {
  //         "app": "tx_signature_proof",
  //         "rawtx": "str...",
  //         "utxos": ["str..."],
  //         "input_index": 0,
  //         "signature_index": 0,
  //         "pubkey": "str..."
  //     }

  //     返回 Json：
  //     {
  //         "id": "0x..."
  //     }
  // used for dapp to apply for compensation
  // For example, the arbitrator gave the wrong signature or signed a transaction that should not have been signed.


}