import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { Loading } from '@/components/base/Loading';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitle } from '@/components/base/PageTitle';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { Button } from '@/components/ui/button';
import { useOwnedArbiter } from '@/services/arbiters/hooks/useOwnedArbiter';
import { RefreshCwIcon } from 'lucide-react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArbiterPreview } from './ArbiterPreview';

const ArbiterDashboard: FC = () => {
  const { fetchOwnedArbiter, ownedArbiter, isPending } = useOwnedArbiter();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>My arbiter</PageTitle>
        <div className='flex gap-4'>
          <Button variant="outline" size="icon" onClick={fetchOwnedArbiter}>
            <RefreshCwIcon />
          </Button>
          <EnsureWalletNetwork continuesTo='Register Arbiter'>
            {
              !isPending && !ownedArbiter && <Button onClick={() => navigate("/register-arbiter")}>Register arbiter</Button>
            }
          </EnsureWalletNetwork>
        </div>
      </PageTitleRow>
      {isPending && <Loading />}
      {
        !isPending && <>
          {ownedArbiter && <ArbiterPreview arbiter={ownedArbiter} />}
          {!ownedArbiter && <div>No arbiter owned yet</div>}
        </>
      }
    </PageContainer>
  );
}


export default ArbiterDashboard;