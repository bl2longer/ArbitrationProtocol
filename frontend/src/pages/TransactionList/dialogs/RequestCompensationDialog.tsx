import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateCompensationRequest } from '@/services/compensations/hooks/contract/useCreateCompensationRequest';
import { CompensationType } from '@/services/compensations/model/compensation-claim';
import { Transaction } from '@/services/transactions/model/transaction';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { FC } from 'react';

export const RequestCompensationDialog: FC<{
  compensationType: CompensationType;
  transaction?: Transaction;
  onHandleClose: () => void;
}> = ({ transaction, compensationType, onHandleClose }) => {
  const { claimIllegalSignatureCompensation, claimTimeoutCompensation, claimFailedArbitrationCompensation, isPending } = useCreateCompensationRequest();

  const handleRequestCompensation = async () => {
    try {
      if (compensationType === "IllegalSignature") {
        // TODO await claimIllegalSignatureCompensation(transaction.id);
      } else if (compensationType === "Timeout") {
        await claimTimeoutCompensation(transaction.id);
      } else if (compensationType === "FailedArbitration") {
        // TODO await claimFailedArbitrationCompensation(transaction.id);
      }

      onHandleClose();
    } catch (error) {
      console.error('Error requesting compensation:', error);
    }
  };

  return <Dialog open={!isNullOrUndefined(compensationType)} onOpenChange={onHandleClose}  >
    <DialogContent aria-description="Submit signature">
      <DialogHeader>
        <DialogTitle>Request compensation</DialogTitle>
      </DialogHeader>

      {compensationType}

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