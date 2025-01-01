import { IconTooltip } from '@/components/base/IconTooltip';
import { Loading } from '@/components/base/Loading';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitle } from '@/components/base/PageTitle';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { SearchInput } from '@/components/base/SearchInput';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { tooltips } from '@/config/tooltips';
import { useDApps } from '@/services/dapp-registry/hooks/useDApps';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { RefreshCwIcon } from 'lucide-react';
import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DAppRow } from './DAppRow';

const fieldLabels = {
  address: 'DApp Address',
  owner: 'Owner',
  status: 'Status'
};

const DAppList: FC = () => {
  const { dapps: rawDApps, refreshDapps } = useDApps();
  const [searchTerm, setSearchTerm] = useState('');
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
        <PageTitle>DApps <IconTooltip title='dApp' tooltip={tooltips.dappIntro} iconClassName='ml-2' iconSize={20} /></PageTitle>
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
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(fieldLabels).map(field => (
                <TableHead key={field}>
                  {fieldLabels[field as keyof typeof fieldLabels]}
                </TableHead>
              ))}
              <TableHead>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dApps?.map((dapp, index) => <DAppRow key={index} dapp={dapp} index={index} fieldLabels={Object.keys(fieldLabels)} />)}
          </TableBody>
        </Table>

        {loading && <Loading />}
      </div>
    </PageContainer>
  );
}



export default DAppList;