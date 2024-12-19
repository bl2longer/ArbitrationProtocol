import { useState, useMemo, FC, useCallback } from 'react';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { PageTitle } from '@/components/base/PageTitle';
import { SearchInput } from '@/components/base/SearchInput';
import { Loading } from '@/components/base/Loading';
import { Checkbox } from '@/components/ui/checkbox';
import { useDApps } from '@/services/dapp-registry/hooks/useDApps';
import { DApp, DAppStatus } from '@/services/dapp-registry/model/dapp';
import { formatAddress } from '@/utils/formatAddress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { RefreshCwIcon } from 'lucide-react';
import { StatusLabel, StatusLabelColor } from '@/components/base/StatusLabel';

const statusMap = {
  0: 'Active',
  1: 'Completed',
  2: 'Arbitrated',
  3: 'Expired',
  4: 'Disputed'
};

const fieldLabels = {
  address: 'DApp Address',
  owner: 'Owner',
  status: 'Status'
};

const DAppList: FC = () => {
  const { dapps: rawDApps, refreshDapps } = useDApps();
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const dApps = useMemo(() => {
    return rawDApps?.filter(dapp => {
      const searchLower = searchTerm.toLowerCase();
      return (
        dapp.address?.toLowerCase().includes(searchLower) ||
        dapp.owner?.toLowerCase().includes(searchLower)
      );
    });
  }, [rawDApps, searchTerm]);

  const loading = useMemo(() => isNullOrUndefined(dApps), [dApps]);

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>DApps List</PageTitle>
        <div className='flex flex-row gap-2 items-center'>
          <Button variant="outline" size="icon" onClick={refreshDapps}>
            <RefreshCwIcon />
          </Button>
          <SearchInput placeholder="Search dApps..."
            value={searchTerm}
            onChange={(newValue) => setSearchTerm(newValue)} />
          <Button onClick={() => navigate("/register-dapp")}>Register dApp</Button>
        </div>
      </PageTitleRow>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              {Object.keys(fieldLabels).map(field => (
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
            {dApps?.map((dapp, index) => <DAppRow key={index} dapp={dapp} index={index} fieldLabels={Object.keys(fieldLabels)} />)}
          </tbody>
        </table>

        {loading && <Loading />}
      </div>
    </PageContainer>
  );
}

const DAppRow: FC<{
  dapp: DApp;
  index: number;
  fieldLabels: string[];
}> = ({ dapp, index, fieldLabels }) => {

  const formatValue = useCallback((key: string, value: any) => {
    if (key === 'address' || key === 'owner') {
      return formatAddress(value);
    }
    else if (key === 'status') {
      const colors: { [status in keyof typeof DAppStatus]: StatusLabelColor } = {
        None: 'none',
        Pending: "yellow",
        Active: "green",
        Terminated: "yellow",
        Suspended: "red",
      };
      return <StatusLabel title={value} color={colors[value]} />
    }
    return value;
  }, []);

  return <tr className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
    {fieldLabels.map(field => (
      <td key={field} className="px-6 py-4 text-sm text-gray-900">
        {formatValue(field, dapp[field as keyof typeof dapp])}
      </td>
    ))}
    {/* Actions */}
    <td className="px-6 py-4 text-sm text-gray-900">
      {/* TODO */}
    </td>
  </tr>
}

export default DAppList;