import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateCompensationRequest } from '@/services/compensations/hooks/contract/useCreateCompensationRequest';
import { Transaction } from '@/services/transactions/model/transaction';
import { FC } from 'react';

export const RequestTimeoutCompensationDialog: FC<{
  isOpen: boolean;
  transaction?: Transaction;
  onHandleClose: () => void;
}> = ({ transaction, isOpen, onHandleClose }) => {
  const { claimTimeoutCompensation, isPending: isSubmittingCompensationRequest } = useCreateCompensationRequest();

  const handleRequestCompensation = async () => {
    try {
      await claimTimeoutCompensation(transaction.id);
      onHandleClose();
    } catch (error) {
      console.error('Error requesting compensation:', error);
    }
  };

  return <Dialog open={isOpen} onOpenChange={onHandleClose}  >
    <DialogContent aria-description="Request compensation">
      <DialogHeader>
        <DialogTitle>Request compensation (Time elapsed)</DialogTitle>
      </DialogHeader>

      <div>
        The arbitration request has not been signed on time by the arbiter. Please confirm you want to request compensation.
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="ghost" disabled={isSubmittingCompensationRequest} onClick={onHandleClose}>
          Cancel
        </Button>
        <Button onClick={handleRequestCompensation} disabled={isSubmittingCompensationRequest}>
          Submit
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}