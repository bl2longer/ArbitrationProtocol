import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ArbitratorInfo } from '../types';
import { 
  MagnifyingGlassIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

export default function ArbitratorList() {
  const { provider } = useWeb3();
  const [arbitrators, setArbitrators] = useState<ArbitratorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ArbitratorInfo['info'] | 'stake' | 'address';
    direction: 'asc' | 'desc';
  }>({ key: 'stake', direction: 'desc' });

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      const mockArbitrators: ArbitratorInfo[] = [
        {
          address: "0x1234567890123456789012345678901234567890",
          info: {
            operator: "0xabcdef1234567890abcdef1234567890abcdef12",
            btcPubKey: "02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc",
            btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            feeRate: BigInt(200),
            termDuration: BigInt(2592000),
          },
          isPaused: false,
          stake: "100.5",
        },
        {
          address: "0x9876543210987654321098765432109876543210",
          info: {
            operator: "0xfedcba9876543210fedcba9876543210fedcba98",
            btcPubKey: "03b1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc",
            btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            feeRate: BigInt(300),
            termDuration: BigInt(1296000),
          },
          isPaused: true,
          stake: "50.0",
        },
        {
          address: "0x5555555555555555555555555555555555555555",
          info: {
            operator: "0x1111111111111111111111111111111111111111",
            btcPubKey: "02c1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc",
            btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            feeRate: BigInt(250),
            termDuration: BigInt(1944000),
          },
          isPaused: false,
          stake: "75.25",
        },
      ];
      setArbitrators(mockArbitrators);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: typeof sortConfig.key) => {
    if (sortConfig.key !== key) return <ChevronUpDownIcon className="w-4 h-4" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4" />
      : <ChevronDownIcon className="w-4 h-4" />;
  };

  const filteredAndSortedArbitrators = arbitrators
    .filter(arb => 
      arb.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arb.info.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arb.info.btcAddress.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = sortConfig.key === 'stake' ? parseFloat(a[sortConfig.key]) 
        : sortConfig.key === 'address' ? a[sortConfig.key]
        : Number(a.info[sortConfig.key]);
      
      let bValue: any = sortConfig.key === 'stake' ? parseFloat(b[sortConfig.key])
        : sortConfig.key === 'address' ? b[sortConfig.key]
        : Number(b.info[sortConfig.key]);

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('address')}>
              <div className="flex items-center space-x-1">
                <span>Address</span>
                {getSortIcon('address')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('feeRate')}>
              <div className="flex items-center space-x-1">
                <span>Fee Rate</span>
                {getSortIcon('feeRate')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('stake')}>
              <div className="flex items-center space-x-1">
                <span>Stake</span>
                {getSortIcon('stake')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAndSortedArbitrators.map((arbitrator) => (
            <tr key={arbitrator.address} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-mono text-sm">
                  {arbitrator.address.slice(0, 6)}...{arbitrator.address.slice(-4)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{Number(arbitrator.info.feeRate) / 100}%</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{arbitrator.stake} ETH</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  arbitrator.isPaused 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {arbitrator.isPaused ? 'Paused' : 'Active'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredAndSortedArbitrators.map((arbitrator) => (
        <div key={arbitrator.address} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">
              {arbitrator.address.slice(0, 6)}...{arbitrator.address.slice(-4)}
            </h3>
            <span className={`px-2 py-1 rounded text-sm ${
              arbitrator.isPaused 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {arbitrator.isPaused ? 'Paused' : 'Active'}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Operator</span>
              <span className="font-mono">{arbitrator.info.operator.slice(0, 6)}...{arbitrator.info.operator.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fee Rate</span>
              <span>{Number(arbitrator.info.feeRate) / 100}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Term Duration</span>
              <span>{Number(arbitrator.info.termDuration) / 86400} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stake</span>
              <span>{arbitrator.stake} ETH</span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-gray-600 mb-1">BTC Address</div>
              <div className="font-mono text-xs break-all">{arbitrator.info.btcAddress}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Arbitrator List</h1>
        <div className="flex space-x-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Search arbitrators..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'} rounded-l-lg border`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'} rounded-r-lg border-t border-r border-b`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? renderListView() : renderGridView()}
    </div>
  );
}
