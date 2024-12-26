import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTransactionSubmitArbitration } from '@/services/transactions/hooks/contract/useTransactionSubmitArbitration';
import { Transaction } from '@/services/transactions/model/transaction';
import { FC, useState } from 'react';

export const SubmitSignatureDialog: FC<{
  transaction: Transaction;
  isOpen: boolean;
  onHandleClose: () => void;
}> = ({ transaction, isOpen, onHandleClose }) => {
  const [signature, setSignature] = useState('todo');
  const { submitArbitration, isPending } = useTransactionSubmitArbitration();

  const handleSubmitSignature = async () => {
    try {
      await submitArbitration(transaction.dapp, signature);
      onHandleClose();
      setSignature('');
    } catch (error) {
      console.error('Error submitting arbitration:', error);
    }
  };

  return <Dialog open={isOpen} onOpenChange={onHandleClose}  >
    <DialogContent aria-description="Submit signature">
      <DialogHeader>
        <DialogTitle>Submit Arbitration</DialogTitle>
      </DialogHeader>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Please sign the following BTC transaction using your BTC wallet:
        </p>
        <div className="bg-gray-100 p-3 rounded break-all">
          {transaction?.btcTx}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          BTC Signature
        </label>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter your BTC signature"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="ghost" disabled={isPending} onClick={onHandleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmitSignature} disabled={isPending || !signature}>
          Submit
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}