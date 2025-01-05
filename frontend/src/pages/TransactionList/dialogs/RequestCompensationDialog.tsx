import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BTC_ZERO_64_WITH_PREFIX } from '@/services/btc/btc';
import { useCreateCompensationRequest } from '@/services/compensations/hooks/contract/useCreateCompensationRequest';
import { CompensationType } from '@/services/compensations/model/compensation-claim';
import { Transaction } from '@/services/transactions/model/transaction';
import { useZKPSubmitVerificationRequest } from '@/services/zkp/hooks/contract/useZKPSubmitVerificationRequest';
import { useZKPVerificationStatus } from '@/services/zkp/hooks/contract/useZKPVerificationStatus';
import { getZKPRequest, saveZKPRequest, ZKPRequest } from '@/services/zkp/storage';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useInterval } from 'usehooks-ts';

export const RequestCompensationDialog: FC<{
  compensationType: CompensationType;
  transaction?: Transaction;
  onHandleClose: () => void;
}> = ({ transaction, compensationType, onHandleClose }) => {
  const { claimIllegalSignatureCompensation, claimTimeoutCompensation, claimFailedArbitrationCompensation, claimArbitratorFee, isPending } = useCreateCompensationRequest();
  const [zkpRequest, setZkpRequest] = useState<ZKPRequest>(undefined); // Locally stored request we possibly already sent to the ZKP service for this transaction.
  const { fetchZKPVerificationStatus } = useZKPVerificationStatus();
  const { submitVerificationRequest } = useZKPSubmitVerificationRequest();
  const [isZKPVerificationReady, setIsZKPVerificationReady] = useState<boolean>(undefined);

  const handleRequestZKPVerification = async () => {
    const requestId = await submitVerificationRequest();
    console.log("ZKP verification request submitted with ID:", requestId);

    const submittedRequest: ZKPRequest = { transactionId: transaction.id, requestId };
    saveZKPRequest(submittedRequest);
    setZkpRequest(submittedRequest);
  }

  const handleRequestCompensation = async () => {
    try {
      if (compensationType === "IllegalSignature") {
        await claimIllegalSignatureCompensation(transaction.arbiter, transaction.btcTx, zkpRequest.requestId);
      } else if (compensationType === "Timeout") {
        await claimTimeoutCompensation(transaction.id);
      } else if (compensationType === "FailedArbitration") {
        await claimFailedArbitrationCompensation(transaction.btcTx, zkpRequest.requestId);
      }
      else if (compensationType === "ArbitratorFee") {
        await claimArbitratorFee(transaction.id);
      }

      onHandleClose();
    } catch (error) {
      console.error('Error requesting compensation:', error);
    }
  };

  const introText = useMemo(() => {
    if (!compensationType)
      return null;

    switch (compensationType) {
      case "Timeout":
        return "The arbitration request has not been signed on time by the arbiter. Please confirm you want to request compensation.";
      case "FailedArbitration":
        return "The arbitration request has been signed by the arbiter but you consider the arbiter has signed the wrong transaction. Please confirm you want to request compensation.";
      case "IllegalSignature":
        return "No arbitration has been requested, but the arbiter has submitted a bitcoin transaction when it shouldnt have. Please confirm you want to request compensation.";
      case "ArbitratorFee":
        return "This transaction has not been handled on time by the arbiter. You can close it.";
      default:
        throw new Error(`Unknown compensation type: ${compensationType}`);
    }
  }, [compensationType]);

  // Whether current compensation type requires ZKP verification before submitting a compensation request.
  const isZkpRequiredForCompensationType = useMemo(() => {
    return compensationType === "IllegalSignature" || compensationType === "FailedArbitration";
  }, [compensationType]);

  const checkZkpStatus = useCallback(async () => {
    if (!isZkpRequiredForCompensationType || !zkpRequest || isZKPVerificationReady)
      return;

    const zkVerificationStatus = await fetchZKPVerificationStatus(zkpRequest.requestId);
    console.log("zkVerificationStatus", zkVerificationStatus);

    // This is way to check that the "ZK verification is ready" recommended by Aria.
    setIsZKPVerificationReady(
      zkVerificationStatus?.status !== 0n ||
      (zkVerificationStatus?.status === 0n && zkVerificationStatus.pubKey === BTC_ZERO_64_WITH_PREFIX)
    );
  }, [isZkpRequiredForCompensationType, zkpRequest, isZKPVerificationReady, fetchZKPVerificationStatus]);

  const canSubmitZKVerificationRequest = useMemo(() => {
    if (compensationType === "Timeout" || compensationType === "ArbitratorFee")
      return false;

    return !zkpRequest;
  }, [compensationType, zkpRequest]);

  const canSubmitCompensationRequest = useMemo(() => {
    if (compensationType === "Timeout" || compensationType === "ArbitratorFee")
      return true;

    // For other kind of claim types, make sure we don't already have a pending request for this transaction.
    return !zkpRequest;
  }, [compensationType, zkpRequest]);

  useEffect(() => {
    setZkpRequest(getZKPRequest(transaction?.id));
  }, [transaction]);

  // Regularly get the latest ZKP status if needed.
  useInterval(() => {
    void checkZkpStatus();
  }, 5000);

  return <Dialog open={!isNullOrUndefined(compensationType)} onOpenChange={onHandleClose}  >
    <DialogContent aria-description="Submit signature">
      <DialogHeader>
        <DialogTitle>Request compensation</DialogTitle>
      </DialogHeader>

      <div>{introText}</div>

      {
        /* ZK verification is needed, but has not been submitted yet */
        isZkpRequiredForCompensationType && !zkpRequest &&
        <div>
          You're about to submit the bitcoin transaction for verification to the ZKP service.
          This will take a few minutes and once completed, you will be able to submit the verification
          proof to request the compensation.
        </div>
      }

      {
        /* ZK verification is needed, has been submitted, but verification is still in progress */
        isZkpRequiredForCompensationType && zkpRequest && !isZKPVerificationReady &&
        <div>
          Your transaction is still being verified, please hold on a few minutes. You will be able
          to submit the verification proof to request the compensation after that.
        </div>
      }

      {
        /* ZK verification is needed, and has been verified by the ZKP service */
        isZkpRequiredForCompensationType && zkpRequest && isZKPVerificationReady &&
        <div>
          Your transaction has been verified, you can now submit the verification proof to request the compensation.
        </div>
      }

      <div className="flex justify-end space-x-4">
        <Button variant="ghost" disabled={isPending} onClick={onHandleClose}>
          Cancel
        </Button>
        {
          canSubmitZKVerificationRequest &&
          <Button onClick={handleRequestZKPVerification} disabled={isPending || !canSubmitZKVerificationRequest}>
            Request verification
          </Button>
        }
        {
          canSubmitCompensationRequest &&
          <Button onClick={handleRequestCompensation} disabled={isPending || !canSubmitCompensationRequest}>
            Submit
          </Button>
        }
      </div>
    </DialogContent>
  </Dialog>
}