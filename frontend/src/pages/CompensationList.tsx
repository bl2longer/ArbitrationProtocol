import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { mockCompensations } from '../mock/data';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';

// Utility function to safely format ether values
const formatEther = (value: string): string => {
  try {
    return "TODO";
    //return ethersutils.formatEther(value);
  } catch (error) {
    console.error('Error formatting ether value:', error);
    return '0';
  }
};

interface Compensation {
  id: string;
  receiver: string;
  amount: string;
  feeAmount: string;
  compensationType: number;
  claimed: boolean;
  assets: {
    type: string;
    amount: string;
    marketValue: string;
  }[];
}

const compensationTypeMap = {
  0: 'Illegal Signature',
  1: 'Timeout Penalty'
};

export default function CompensationList() {
  const { evmAccount: account } = useWalletContext();
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [selectedCompensation, setSelectedCompensation] = useState<Compensation | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 直接使用mock数据
        setCompensations(mockCompensations);

        setLoading(false);
      } catch (err) {
        console.error('Error loading compensations:', err);
        setError('Failed to load compensations');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleClaimCompensation = async (compensation: Compensation) => {
    try {
      // 这里需要根据实际合约方法调整
      // TODO await contract.claimCompensation(compensation.id);
      setIsDetailsDialogOpen(false);
    } catch (error) {
      console.error('Error claiming compensation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Receiver
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {compensations.map((compensation, index) => (
              <tr key={compensation.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {compensation.id.slice(0, 10)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {compensation.receiver.slice(0, 10)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatEther(compensation.amount)} ETH
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {compensationTypeMap[compensation.compensationType as keyof typeof compensationTypeMap]}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${compensation.claimed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
                    {compensation.claimed ? 'Claimed' : 'Unclaimed'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {!compensation.claimed && (
                    <button
                      onClick={() => {
                        setSelectedCompensation(compensation);
                        setIsDetailsDialogOpen(true);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Claim Compensation
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Compensation Details
            </Dialog.Title>

            {selectedCompensation && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Total Amount</h3>
                  <p className="mt-1 text-lg font-semibold">
                    {formatEther(selectedCompensation.amount)} ETH
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Fee Amount</h3>
                  <p className="mt-1">
                    {formatEther(selectedCompensation.feeAmount)} ETH
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Assets</h3>
                  <div className="mt-2 space-y-2">
                    {selectedCompensation.assets.map((asset, index) => (
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
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setIsDetailsDialogOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleClaimCompensation(selectedCompensation)}
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
    </div>
  );
}
