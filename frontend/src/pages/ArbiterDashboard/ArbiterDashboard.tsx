import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { Loading } from '@/components/base/Loading';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitle } from '@/components/base/PageTitle';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { Button } from '@/components/ui/button';
import { useOwnedArbiter } from '@/services/arbiters/hooks/useOwnedArbiter';
import { Layers2Icon, StarIcon } from 'lucide-react';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArbiterPreview } from './ArbiterPreview';
import { EditOperatorDialog } from './dialogs/EditOperator';
import { EditStakingDialog } from './dialogs/EditStaking';

const ArbiterDashboard: FC = () => {
  const { ownedArbiter, isPending } = useOwnedArbiter();
  const navigate = useNavigate();
  const [editOperatorIsOpen, setEditOperatorIsOpen] = useState(false);
  const [editStakingIsOpen, setEditStakingIsOpen] = useState(false);

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>My arbiter</PageTitle>
        <div className='flex gap-4'>
          <EnsureWalletNetwork continuesTo=''>
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

      {ownedArbiter && <EditOperatorDialog arbiter={ownedArbiter} isOpen={editOperatorIsOpen} onHandleClose={() => setEditOperatorIsOpen(false)} />}
      {ownedArbiter && <EditStakingDialog arbiter={ownedArbiter} isOpen={editStakingIsOpen} onHandleClose={() => setEditStakingIsOpen(false)} />}
    </PageContainer>
  );
}


export default ArbiterDashboard;