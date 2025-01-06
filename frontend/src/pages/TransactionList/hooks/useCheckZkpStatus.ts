import { BTC_ZERO_64_WITH_PREFIX } from "@/services/btc/btc";
import { useZKPVerificationStatus } from "@/services/zkp/hooks/contract/useZKPVerificationStatus";
import { ZKPRequest } from "@/services/zkp/storage";
import { useCallback, useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";

export enum ZKVerificationStatus {
  Unknown,
  Verifying,
  Failed,
  Verified
}

export const useCheckZkpStatus = (zkpRequest: ZKPRequest) => {
  const { fetchZKPVerificationStatus } = useZKPVerificationStatus();
  const [zkpVerificationStatus, setZkpVerificationStatus] = useState<ZKVerificationStatus>(ZKVerificationStatus.Unknown);

  const checkZkpStatus = useCallback(async () => {
    if (!zkpRequest) {
      setZkpVerificationStatus(ZKVerificationStatus.Unknown);
      return;
    }

    if (zkpVerificationStatus === ZKVerificationStatus.Verified || zkpVerificationStatus === ZKVerificationStatus.Failed)
      return;

    const contractStatus = await fetchZKPVerificationStatus(zkpRequest.requestId);
    console.log("ZKP verification contractStatus:", contractStatus);

    if (!contractStatus)
      return;

    /**
     * - pubkey != null and status == 0 -> completed, can submit compensation
     * - status != 0 -> completed, failure
     * - pubkey == null  and status == 0-> verification on going
     */
    const isPubKeyNull = contractStatus.pubKey === BTC_ZERO_64_WITH_PREFIX || contractStatus.pubKey === "0x";
    if (!isPubKeyNull && contractStatus.status === 0n)
      setZkpVerificationStatus(ZKVerificationStatus.Verified);
    else if (contractStatus.status !== 0n)
      setZkpVerificationStatus(ZKVerificationStatus.Failed);
    else if (isPubKeyNull && contractStatus.status === 0n)
      setZkpVerificationStatus(ZKVerificationStatus.Verifying);
    else
      setZkpVerificationStatus(ZKVerificationStatus.Unknown);
  }, [zkpRequest, zkpVerificationStatus, fetchZKPVerificationStatus]);

  // Regularly get the latest ZKP status if needed.
  useInterval(() => {
    void checkZkpStatus();
  }, 5000);

  useEffect(() => {
    if (!zkpRequest)
      setZkpVerificationStatus(ZKVerificationStatus.Unknown);
  }, [zkpRequest]);

  return zkpVerificationStatus;
}