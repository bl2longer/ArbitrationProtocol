import { FC, useState } from 'react';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { PageTitle } from '@/components/base/PageTitle';
import { Button } from '@/components/ui/button';
import { ArbitratorPreview } from './ArbitratorPreview';
import { Loading } from '@/components/base/Loading';
import { useNavigate } from 'react-router-dom';
import { EditOperatorDialog } from './dialogs/EditOperator';
import { useOwnedArbitrator } from '@/services/arbitrators/hooks/useOwnedArbitrator';
import { Layers2Icon, StarIcon } from 'lucide-react';
import { EditStakingDialog } from './dialogs/EditStaking';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';

const ArbitratorDashboard: FC = () => {
  const { ownedArbitrator, isPending } = useOwnedArbitrator();
  const navigate = useNavigate();
  const [editOperatorIsOpen, setEditOperatorIsOpen] = useState(false);
  const [editStakingIsOpen, setEditStakingIsOpen] = useState(false);

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>My arbitrator</PageTitle>
        <div className='flex gap-4'>
          <EnsureWalletNetwork continuesTo=''>
            {
              ownedArbitrator && <>
                <Button onClick={() => setEditStakingIsOpen(true)} disabled={isPending}><Layers2Icon />Edit staking</Button>
              </>
            }
            {
              ownedArbitrator && <>
                <Button onClick={() => setEditOperatorIsOpen(true)} disabled={isPending}><StarIcon />Edit operator</Button>
              </>
            }
            {
              !isPending && !ownedArbitrator && <Button onClick={() => navigate("/register-arbitrator")}>Register arbitrator</Button>
            }
          </EnsureWalletNetwork>
        </div>
      </PageTitleRow>
      {isPending && <Loading />}
      {
        !isPending && <>
          {ownedArbitrator && <ArbitratorPreview arbitrator={ownedArbitrator} />}
          {!ownedArbitrator && <div>No arbitrator owned yet</div>}
        </>
      }

      {ownedArbitrator && <EditOperatorDialog arbitrator={ownedArbitrator} isOpen={editOperatorIsOpen} onHandleClose={() => setEditOperatorIsOpen(false)} />}
      {ownedArbitrator && <EditStakingDialog arbitrator={ownedArbitrator} isOpen={editStakingIsOpen} onHandleClose={() => setEditStakingIsOpen(false)} />}
    </PageContainer>
  );
}


export default ArbitratorDashboard;