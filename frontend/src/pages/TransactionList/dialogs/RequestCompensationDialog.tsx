import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateCompensationRequest } from '@/services/compensations/hooks/contract/useCreateCompensationRequest';
import { CompensationType } from '@/services/compensations/model/compensation-claim';
import { Transaction } from '@/services/transactions/model/transaction';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { FC, useMemo } from 'react';

export const RequestCompensationDialog: FC<{
  compensationType: CompensationType;
  transaction?: Transaction;
  onHandleClose: () => void;
}> = ({ transaction, compensationType, onHandleClose }) => {
  const { claimIllegalSignatureCompensation, claimTimeoutCompensation, claimFailedArbitrationCompensation, claimArbitratorFee, isPending } = useCreateCompensationRequest();

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

  return <Dialog open={!isNullOrUndefined(compensationType)} onOpenChange={onHandleClose}  >
    <DialogContent aria-description="Submit signature">
      <DialogHeader>
        <DialogTitle>Request compensation</DialogTitle>
      </DialogHeader>

      {introText}

      <div className="flex justify-end space-x-4">
        <Button variant="ghost" disabled={isPending} onClick={onHandleClose}>
          Cancel
        </Button>
        <Button onClick={handleRequestCompensation} disabled={isPending}>
          Submit
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}