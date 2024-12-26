import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { Loading } from '@/components/base/Loading';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitle } from '@/components/base/PageTitle';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { Button } from '@/components/ui/button';
import { useOwnedArbiter } from '@/services/arbiters/hooks/useOwnedArbiter';
import { DollarSignIcon, Layers2Icon, RefreshCwIcon, SettingsIcon, StarIcon } from 'lucide-react';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArbiterPreview } from './ArbiterPreview';
import { EditOperatorDialog } from './dialogs/EditOperator';
import { EditRevenueDialog } from './dialogs/EditRevenue';
import { EditSettingsDialog } from './dialogs/EditSettings';
import { EditStakingDialog } from './dialogs/EditStaking';

const ArbiterDashboard: FC = () => {
  const { fetchOwnedArbiter, ownedArbiter, isPending } = useOwnedArbiter();
  const navigate = useNavigate();
  const [editSettingsIsOpen, setEditSettingsIsOpen] = useState(false);
  const [editOperatorIsOpen, setEditOperatorIsOpen] = useState(false);
  const [editStakingIsOpen, setEditStakingIsOpen] = useState(false);
  const [editRevenueIsOpen, setEditRevenueIsOpen] = useState(false);

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>My arbiter</PageTitle>
        <div className='flex gap-4'>
          <Button variant="outline" size="icon" onClick={fetchOwnedArbiter}>
            <RefreshCwIcon />
          </Button>
          <EnsureWalletNetwork continuesTo=''>
            {
              ownedArbiter && <>
                <Button onClick={() => setEditSettingsIsOpen(true)} disabled={isPending}><SettingsIcon />Edit settings</Button>
              </>
            }
            {
              ownedArbiter && <>
                <Button onClick={() => setEditStakingIsOpen(true)} disabled={isPending}><Layers2Icon />Edit staking</Button>
              </>
            }
            {
              ownedArbiter && <>
                <Button onClick={() => setEditOperatorIsOpen(true)} disabled={isPending}><StarIcon />Edit operator</Button>
              </>
            }
            {
              ownedArbiter && <>
                <Button onClick={() => setEditRevenueIsOpen(true)} disabled={isPending}><DollarSignIcon />Edit revenue</Button>
              </>
            }
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

      {ownedArbiter && <EditSettingsDialog arbiter={ownedArbiter} isOpen={editSettingsIsOpen} onHandleClose={() => setEditSettingsIsOpen(false)} />}
      {ownedArbiter && <EditOperatorDialog arbiter={ownedArbiter} isOpen={editOperatorIsOpen} onHandleClose={() => setEditOperatorIsOpen(false)} />}
      {ownedArbiter && <EditStakingDialog arbiter={ownedArbiter} isOpen={editStakingIsOpen} onHandleClose={() => setEditStakingIsOpen(false)} />}
      {ownedArbiter && <EditRevenueDialog arbiter={ownedArbiter} isOpen={editRevenueIsOpen} onHandleClose={() => setEditRevenueIsOpen(false)} />}
    </PageContainer>
  );
}


export default ArbiterDashboard;