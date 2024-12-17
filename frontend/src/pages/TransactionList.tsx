import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { ethers } from 'ethers';
import { mockTransactions } from '../mock/data';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';

// Utility function to safely format ether values
// const formatEther = (value: string): string => {
//   try {
//     return ethers.utils.formatEther(value);
//   } catch (error) {
//     console.error('Error formatting ether value:', error);
//     return '0';
//   }
// };

interface Transaction {
  dapp: string;
  arbitrator: string;
  startTime: number;
  deadline: number;
  btcTx: string;
  status: number;
  depositedFee: string;
  signature: string;
}

const statusMap = {
  0: 'Active',
  1: 'Completed',
  2: 'Arbitrated',
  3: 'Expired',
  4: 'Disputed'
};

const fieldLabels = {
  dapp: 'DApp Address',
  arbitrator: 'Arbitrator',
  startTime: 'Start Time',
  deadline: 'Deadline',
  btcTx: 'BTC Transaction',
  status: 'Status',
  depositedFee: 'Deposited Fee',
  signature: 'Signature'
};

export default function TransactionList() {
  const { evmAccount: account } = useWalletContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(Object.keys(fieldLabels));
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always use mock data for now since we're in development
        setTransactions(mockTransactions);
        setLoading(false);
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError('Failed to load transactions');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmitArbitration = async () => {
    if (!selectedTransaction || !signature) return;
    try {
      // 这里需要根据实际合约方法调整
      // TODO await contract.submitArbitration(selectedTransaction.dapp, signature);
      setIsSignDialogOpen(false);
      setSignature('');
    } catch (error) {
      console.error('Error submitting arbitration:', error);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tx.dapp.toLowerCase().includes(searchLower) ||
      tx.arbitrator.toLowerCase().includes(searchLower) ||
      tx.btcTx.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatValue = (key: string, value: any) => {
    if (key === 'startTime' || key === 'deadline') {
      return new Date(value).toLocaleString();
    }
    if (key === 'status') {
      return statusMap[value as keyof typeof statusMap];
    }
    // if (key === 'depositedFee') {
    //   return `${formatEther(value)} ETH`;
    // }
    if (key === 'dapp' || key === 'arbitrator') {
      return value.slice(0, 10) + '...';
    }
    if (key === 'btcTx') {
      return value.slice(0, 20) + '...';
    }
    return value;
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
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search transactions..."
          className="w-full px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Display Fields</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(fieldLabels).map(([key, label]) => (
            <label key={key} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedFields.includes(key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFields([...selectedFields, key]);
                  } else {
                    setSelectedFields(selectedFields.filter(f => f !== key));
                  }
                }}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              {selectedFields.map(field => (
                <th key={field} className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {fieldLabels[field as keyof typeof fieldLabels]}
                </th>
              ))}
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {selectedFields.map(field => (
                  <td key={field} className="px-6 py-4 text-sm text-gray-900">
                    {formatValue(field, tx[field as keyof Transaction])}
                  </td>
                ))}
                <td className="px-6 py-4 text-sm">
                  {tx.status === 0 && (
                    <button
                      onClick={() => {
                        setSelectedTransaction(tx);
                        setIsSignDialogOpen(true);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Submit Arbitration
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isSignDialogOpen}
        onClose={() => setIsSignDialogOpen(false)}
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
                {selectedTransaction?.btcTx}
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
                onClick={() => setIsSignDialogOpen(false)}
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
    </div>
  );
}
