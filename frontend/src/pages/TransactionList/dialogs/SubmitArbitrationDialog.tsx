import { Dialog } from '@headlessui/react';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { FC, useState } from 'react';
import { Transaction } from '@/services/transactions/model/transaction';

export const SubmitArbitrationDialog: FC<{
  transaction: Transaction;
  isOpen: boolean;
  onHandleClose: () => void;
}> = ({ transaction, isOpen, onHandleClose }) => {
  const [signature, setSignature] = useState('');

  const handleSubmitArbitration = () => {
    if (!transaction || !signature) return;
    try {
      // TODO await contract.submitArbitration(selectedTransaction.dapp, signature);
      onHandleClose();
      setSignature('');
    } catch (error) {
      console.error('Error submitting arbitration:', error);
    }
  };

  return <Dialog
    open={isOpen}
    onClose={onHandleClose}
    className="fixed inset-0 z-10 overflow-y-auto"
  >
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

      <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <Dialog.Title className="text-lg font-medium mb-4">
          Submit Arbitration
        </Dialog.Title>

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
          <button
            onClick={onHandleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitArbitration}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
            disabled={!signature}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </Dialog>
}