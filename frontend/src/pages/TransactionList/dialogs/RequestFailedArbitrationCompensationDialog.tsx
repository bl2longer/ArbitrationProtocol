import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useArbiterInfo } from '@/services/arbiters/hooks/contract/useArbiterInfo';
import { useCreateCompensationRequest } from '@/services/compensations/hooks/contract/useCreateCompensationRequest';
import { Transaction } from '@/services/transactions/model/transaction';
import { useZKPSubmitVerificationRequest } from '@/services/zkp/hooks/contract/useZKPSubmitVerificationRequest';
import { getZKPRequest, saveZKPRequest, ZKPRequest } from '@/services/zkp/storage';
import { getParamsForZKPRequest } from '@/services/zkp/zkp.service';
import { FC, useEffect, useMemo, useState } from 'react';
import { useCheckZkpStatus, ZKVerificationStatus } from '../hooks/useCheckZkpStatus';

export const RequestFailedArbitrationCompensationDialog: FC<{
  isOpen: boolean;
  transaction?: Transaction;
  onHandleClose: () => void;
}> = ({ transaction, isOpen, onHandleClose }) => {
  const { claimFailedArbitrationCompensation, isPending: isSubmittingCompensationRequest } = useCreateCompensationRequest();
  const [zkpRequest, setZkpRequest] = useState<ZKPRequest>(undefined); // Locally stored request we possibly already sent to the ZKP service for this transaction.
  const { submitVerificationRequest, isPending: isSubmittingZKPVerificationRequest } = useZKPSubmitVerificationRequest();
  const { fetchArbiterInfo } = useArbiterInfo(transaction?.arbiter);
  const [isFetchingZKPParams, setIsFetchingZKPParams] = useState(false);
  const zkpVerificationStatus = useCheckZkpStatus(zkpRequest);

  const handleRequestZKPVerification = async () => {
    setIsFetchingZKPParams(true);

    const zkpRequestParams = await getParamsForZKPRequest(transaction.btcTx);
    const arbiter = await fetchArbiterInfo();

    if (zkpRequestParams && arbiter) {
      const inputIndex = 0; // TODO - find the right index according to zehua's method. Could be non 0 in case of malicious tx.

      // pubKey is always the ARBITER operator pubkey
      const requestId = await submitVerificationRequest(arbiter.operatorBtcPubKey, transaction.btcTx, zkpRequestParams.utxos, inputIndex, 0);
      console.log("ZKP verification request submitted with ID:", requestId);

      if (requestId) {
        const submittedRequest: ZKPRequest = { transactionId: transaction.id, requestId };
        saveZKPRequest(submittedRequest);
        setZkpRequest(submittedRequest);
      }
    }
    else {
      console.error("ZKP verification request: failed to fetch arbiter");
    }

    setIsFetchingZKPParams(false);
  }

  const handleRequestCompensation = async () => {
    try {
      await claimFailedArbitrationCompensation(transaction.btcTx, zkpRequest.requestId);
      onHandleClose();
    } catch (error) {
      console.error('Error requesting compensation:', error);
    }
  };

  const canSubmitZKVerificationRequest = useMemo(() => !zkpRequest, [zkpRequest]);
  const canSubmitCompensationRequest = useMemo(() => zkpVerificationStatus === ZKVerificationStatus.Verified, [zkpVerificationStatus]);

  useEffect(() => {
    if (isOpen)
      setZkpRequest(getZKPRequest(transaction?.id));
    else
      setZkpRequest(null);
  }, [transaction, isOpen]);

  return <Dialog open={isOpen} onOpenChange={onHandleClose}  >
    <DialogContent aria-description="Request compensation">
      <DialogHeader>
        <DialogTitle>Request compensation (Failed arbitration)</DialogTitle>
      </DialogHeader>

      <div>
        The arbitration request has been signed by the arbiter but you consider the arbiter has signed the wrong transaction. Please confirm you want to request compensation.
      </div>

      {
        /* ZK verification is needed, but has not been submitted yet */
        !zkpRequest &&
        <div>
          You're about to submit the bitcoin transaction for verification to the ZKP service.
          This will take a few minutes and once completed, you will be able to submit the verification
          proof to request the compensation.
        </div>
      }

      {
        /* ZK verification is needed, has been submitted, but verification is still in progress */
        zkpRequest && zkpVerificationStatus === ZKVerificationStatus.Verifying &&
        <div>
          Your transaction is still being verified, please hold on a few minutes. You will be able
          to submit the verification proof to request the compensation after that.
        </div>
      }

      {
        /* ZK verification is needed, and has been verified by the ZKP service */
        zkpRequest && zkpVerificationStatus === ZKVerificationStatus.Verified &&
        <div>
          Your transaction has been verified, you can now submit the verification proof to request the compensation.
        </div>
      }

      {
        /* ZK verification is needed, has been submitted, but failed for some reason */
        zkpRequest && zkpVerificationStatus === ZKVerificationStatus.Failed &&
        <div className='text-primary'>
          Unfortunately, your transaction failed verification for some reason, you cannot request compensation.
        </div>
      }

      {
        zkpRequest && zkpVerificationStatus === ZKVerificationStatus.Unknown &&
        <div>
          Checking ZKP verification status...
        </div>
      }

      <div className="flex justify-end space-x-4">
        <Button variant="ghost" disabled={isSubmittingCompensationRequest || isSubmittingZKPVerificationRequest} onClick={onHandleClose}>
          Cancel
        </Button>
        {
          canSubmitZKVerificationRequest &&
          <Button onClick={handleRequestZKPVerification} disabled={isFetchingZKPParams || isSubmittingZKPVerificationRequest || !canSubmitZKVerificationRequest}>
            Request verification
          </Button>
        }
        {
          canSubmitCompensationRequest &&
          <Button onClick={handleRequestCompensation} disabled={isSubmittingCompensationRequest || !canSubmitCompensationRequest}>
            Submit
          </Button>
        }
      </div>
    </DialogContent>
  </Dialog>
}