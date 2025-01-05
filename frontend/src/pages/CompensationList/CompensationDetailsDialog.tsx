import { CompensationClaim } from '@/services/compensations/model/compensation-claim';
import { Dialog } from '@headlessui/react';
import { FC } from 'react';

export const CompensationDetailsDialog: FC<{
  compensation: CompensationClaim;
  isOpen: boolean;
  onClose: () => void;
}> = ({ compensation, isOpen, onClose }) => {

  const handleClaimCompensation = () => {
    try {
      // TODO await contract.claimCompensation(compensation.id);
      onClose();
    } catch (error) {
      console.error('Error claiming compensation:', error);
    }
  };

  return <Dialog
    open={isOpen}
    onClose={onClose}
    className="fixed inset-0 z-10 overflow-y-auto"
  >
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

      <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <Dialog.Title className="text-lg font-medium mb-4">
          Compensation Details
        </Dialog.Title>

        {compensation && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Total Amount</h3>
              <p className="mt-1 text-lg font-semibold">
                {`${compensation.ethAmount}`} ETH
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Fee Amount</h3>
              <p className="mt-1">
                {/* {compensation.feeAmount} ETH */}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Assets</h3>
              <div className="mt-2 space-y-2">
                {/* {selectedCompensation.assets.map((asset, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{asset.type}</span>
                      <span className="text-sm">
                        {asset.amount} ({asset.marketValue} USD)
                      </span>
                    </div>
                  </div>
                ))} */}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleClaimCompensation()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
              >
                Confirm Claim
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </Dialog>
};