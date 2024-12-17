import { useState, useEffect, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useArbitrators } from '@/services/arbitrators/hooks/useArbitrators';
import { ArbitratorInfo } from '@/services/arbitrators/model/arbitrator-info';
import { ListView } from './ListView';
import { GridView } from './GridView';

export type SortConfig = {
  key: 'stake' | 'address';
  direction: 'asc' | 'desc';
};

export default function ArbitratorList() {
  const { arbitrators: rawArbitrators } = useArbitrators();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'stake', direction: 'desc' });

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const arbitrators = useMemo(() => {
    const filtered = rawArbitrators.filter(arb => arb.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const directionFactor = sortConfig.direction === 'asc' ? 1 : -1;
    switch (sortConfig.key) {
      case "address":
        return filtered.sort((a, b) => a.address.localeCompare(b.address) * directionFactor);
      case "stake":
        return filtered.sort((a, b) => Number(a.ethAmount - b.ethAmount) * directionFactor);
    }
  }, [rawArbitrators]);

  const loading = useMemo(() => !rawArbitrators, [rawArbitrators]);

  if (loading)
    return <div className="flex justify-center items-center h-64">Loading...</div>;

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

      {viewMode === 'list' && <ListView arbitrators={arbitrators} sortConfig={sortConfig} handleSort={handleSort} />}
      {viewMode === 'grid' && <GridView arbitrators={arbitrators} />}
    </div>
  );
}
