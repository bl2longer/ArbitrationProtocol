import { useState, useEffect } from 'react';
import { ArbitratorInfo } from '../../types';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useEVMContext } from '@/contexts/EVMContext/EVMContext';

export default function ArbitratorDashboard() {
  const { evmAccount: account } = useWalletContext();
  const { connect: connectWallet } = useEVMContext();
  const [arbitratorInfo, setArbitratorInfo] = useState<ArbitratorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    operator: '',
    btcPubKey: '',
    btcAddress: '',
    feeRate: '',
    termDuration: '',
  });

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      const mockData: ArbitratorInfo = {
        address: account || '0x1234567890123456789012345678901234567890',
        info: {
          operator: '0xabcdef1234567890abcdef1234567890abcdef12',
          btcPubKey: '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc',
          btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          feeRate: BigInt(200),
          termDuration: BigInt(2592000),
        },
        isPaused: false,
        stake: '100.5',
      };
      setArbitratorInfo(mockData);
      setEditForm({
        operator: mockData.info.operator,
        btcPubKey: mockData.info.btcPubKey,
        btcAddress: mockData.info.btcAddress,
        feeRate: (Number(mockData.info.feeRate) / 100).toString(),
        termDuration: (Number(mockData.info.termDuration) / 86400).toString(),
      });
      setLoading(false);
    }, 1000);
  }, [account]);

  const handleSubmit = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    // 这里添加实际的合约调用逻辑
    console.log('Submitting changes:', editForm);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!arbitratorInfo) {
    return <div className="text-center">No arbitrator information found</div>;
  }

  const renderViewMode = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Arbitrator Information</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PencilIcon className="h-5 w-5" />
          <span>Edit</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        <div className="p-4 space-y-2">
          <div className="text-sm text-gray-500">Address</div>
          <div className="font-mono">{arbitratorInfo.address}</div>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm text-gray-500">Operator</div>
          <div className="font-mono">{arbitratorInfo.info.operator}</div>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm text-gray-500">BTC Public Key</div>
          <div className="font-mono break-all">{arbitratorInfo.info.btcPubKey}</div>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm text-gray-500">BTC Address</div>
          <div className="font-mono">{arbitratorInfo.info.btcAddress}</div>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm text-gray-500">Fee Rate</div>
          <div>{Number(arbitratorInfo.info.feeRate) / 100}%</div>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm text-gray-500">Term Duration</div>
          <div>{Number(arbitratorInfo.info.termDuration) / 86400} days</div>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm text-gray-500">Stake Amount</div>
          <div>{arbitratorInfo.stake} ETH</div>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm text-gray-500">Status</div>
          <div>
            <span className={`px-2 py-1 rounded text-sm ${arbitratorInfo.isPaused
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
              }`}>
              {arbitratorInfo.isPaused ? 'Paused' : 'Active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Edit Arbitrator Information</h2>
        <button
          onClick={() => setIsEditing(false)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
          <span>Cancel</span>
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="space-y-6">
        <div className="bg-white rounded-lg shadow divide-y">
          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">Operator Address</label>
            <input
              type="text"
              value={editForm.operator}
              onChange={(e) => setEditForm(prev => ({ ...prev, operator: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">BTC Public Key</label>
            <input
              type="text"
              value={editForm.btcPubKey}
              onChange={(e) => setEditForm(prev => ({ ...prev, btcPubKey: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">BTC Address</label>
            <input
              type="text"
              value={editForm.btcAddress}
              onChange={(e) => setEditForm(prev => ({ ...prev, btcAddress: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">Fee Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={editForm.feeRate}
              onChange={(e) => setEditForm(prev => ({ ...prev, feeRate: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">Term Duration (days)</label>
            <input
              type="number"
              step="1"
              value={editForm.termDuration}
              onChange={(e) => setEditForm(prev => ({ ...prev, termDuration: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Wallet Connection</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={connectWallet}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 min-w-[200px]"
          >
            {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect MetaMask'}
          </button>
          <button
            // onClick={connectBtcWallet}
            className="flex-1 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 min-w-[200px]"
          >
            Connect BTC Wallet
          </button>
        </div>
      </div>

      {isEditing ? renderEditMode() : renderViewMode()}
    </div>
  );
}
