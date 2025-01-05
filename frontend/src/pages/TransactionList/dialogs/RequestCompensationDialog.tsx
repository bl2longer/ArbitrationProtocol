import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateCompensationRequest } from '@/services/compensations/hooks/contract/useCreateCompensationRequest';
import { CompensationType } from '@/services/compensations/model/compensation-claim';
import { Transaction } from '@/services/transactions/model/transaction';
import { useZKPVerificationStatus } from '@/services/zkp/hooks/contract/useZKPVerificationStatus';
import { getZKPRequest } from '@/services/zkp/storage';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { FC, useCallback, useMemo, useState } from 'react';
import { useInterval } from 'usehooks-ts';

export const RequestCompensationDialog: FC<{
  compensationType: CompensationType;
  transaction?: Transaction;
  onHandleClose: () => void;
}> = ({ transaction, compensationType, onHandleClose }) => {
  const { claimIllegalSignatureCompensation, claimTimeoutCompensation, claimFailedArbitrationCompensation, claimArbitratorFee, isPending } = useCreateCompensationRequest();
  const zkpRequest = getZKPRequest(transaction?.id); // Locally stored request we possibly already sent to the ZKP service for this transaction.
  const { fetchZKPVerificationStatus } = useZKPVerificationStatus();
  const [isZKPVerificationReady, setIsZKPVerificationReady] = useState<boolean>(undefined);

  const handleRequestCompensation = async () => {
    try {
      if (compensationType === "IllegalSignature") {
        // TODO await claimIllegalSignatureCompensation(transaction.id);
      } else if (compensationType === "Timeout") {
        await claimTimeoutCompensation(transaction.id);
      } else if (compensationType === "FailedArbitration") {
        // TODO await claimFailedArbitrationCompensation(transaction.id);
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

  // Whether ZKP request has been submitted to the zkservice contract.
  const isZkpRequestSubmitted = useMemo(() => {
    if (compensationType === "Timeout" || compensationType === "ArbitratorFee")
      return true;

    // For other kind of claim types, make sure we don't already have a pending request for this transaction.
    return !zkpRequest;
  }, [compensationType, zkpRequest]);

  const checkZkpStatus = useCallback(async () => {
    if (!isZkpRequiredForCompensationType || !isZkpRequestSubmitted)
      return;

    const zkVerificationStatus = await fetchZKPVerificationStatus(zkpRequest.requestId);
    console.log("zkVerificationStatus", zkVerificationStatus);

    // TODO: set zkpverificationready based on result

  }, [isZkpRequiredForCompensationType, isZkpRequestSubmitted, fetchZKPVerificationStatus, zkpRequest]);

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
        isZkpRequiredForCompensationType && !isZkpRequestSubmitted &&
        <div>
          You're about to submit the bitcoin transaction for verification to the ZKP service.
          This will take a few minutes and once completed, you'll be able to submit the verification
          proof to request the compensation.
        </div>
      }

      <div className="flex justify-end space-x-4">
        <Button variant="ghost" disabled={isPending} onClick={onHandleClose}>
          Cancel
        </Button>
        <Button onClick={handleRequestCompensation} disabled={isPending || !isZkpRequestSubmitted}>
          Submit
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}