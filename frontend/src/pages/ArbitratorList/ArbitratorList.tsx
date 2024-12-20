import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { PageTitle } from '@/components/base/PageTitle';
import { SearchInput } from '@/components/base/SearchInput';
import { Loading } from '@/components/base/Loading';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { RefreshCwIcon } from 'lucide-react';
import { useOwnedArbitrator } from '@/services/arbitrators/hooks/useOwnedArbitrator';
import { useCall } from 'wagmi';

type ViewMode = 'grid' | 'list';

export type SortConfig = {
  key: 'stake' | 'address' | 'currentFeeRate';
  direction: 'asc' | 'desc';
};

export default function ArbitratorList() {
  const { arbitrators: rawArbitrators, fetchArbitrators: refreshArbitrators } = useArbitrators();
  const { ownedArbitrator } = useOwnedArbitrator();
  const [viewMode, setViewMode] = useState<ViewMode>(localStorage.getItem('arbitratorListMode') as ViewMode || 'grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'stake', direction: 'desc' });
  const navigate = useNavigate();

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('arbitratorListMode', mode);
  }, []);

  const arbitrators = useMemo(() => {
    const filtered = rawArbitrators?.filter(arb => arb.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const directionFactor = sortConfig.direction === 'asc' ? 1 : -1;
    switch (sortConfig.key) {
      case "address":
        return filtered?.sort((a, b) => a.address.localeCompare(b.address) * directionFactor);
      case "stake":
        return filtered?.sort((a, b) => Number(a.ethAmount - b.ethAmount) * directionFactor);
      case "currentFeeRate":
        return filtered?.sort((a, b) => Number(a.currentFeeRate - b.currentFeeRate) * directionFactor);
      default:
        throw new Error(`Unknown sort key: ${sortConfig.key}`);
    }
  }, [rawArbitrators, searchTerm, sortConfig]);

  const loading = useMemo(() => !rawArbitrators, [rawArbitrators]);

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>Arbitrator List</PageTitle>
        <div className="flex space-x-4 w-full sm:w-auto items-center">
          <Button variant="outline" size="icon" onClick={refreshArbitrators}>
            <RefreshCwIcon />
          </Button>
          <SearchInput placeholder="Search arbitrators..."
            value={searchTerm}
            onChange={(newValue) => setSearchTerm(newValue)} />
          <div className="flex rounded-lg shadow-sm">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600'} rounded-l-lg border`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600'} rounded-r-lg border-t border-r border-b`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
          <Button disabled={!!ownedArbitrator} onClick={() => navigate("/register-arbitrator")}>Register arbitrator</Button>
        </div>
      </PageTitleRow>

      {loading && <Loading />}
      {!loading && <>
        {viewMode === 'list' && <ListView arbitrators={arbitrators} sortConfig={sortConfig} handleSort={handleSort} />}
        {viewMode === 'grid' && <GridView arbitrators={arbitrators} />}
      </>}
    </PageContainer>
  );
}
