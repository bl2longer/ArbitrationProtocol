import { FC, useState } from 'react';
import { useOwnedArbitrator } from '@/services/arbitrators/hooks/useOwnedArbitrator';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { PageTitle } from '@/components/base/PageTitle';
import { Button } from '@/components/ui/button';
import { PencilIcon } from '@heroicons/react/24/outline';
import { ArbitratorPreview } from './ArbitratorPreview';
import { Loading } from '@/components/base/Loading';
import { useNavigate } from 'react-router-dom';
import { EditOperatorDialog } from './dialogs/EditOperator';

const ArbitratorDashboard: FC = () => {
  const { ownedArbitrator, isPending } = useOwnedArbitrator();
  const navigate = useNavigate();
  const [editOperatorIsOpen, setEditOperatorIsOpen] = useState(false);

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>My arbitrator</PageTitle>
        {
          ownedArbitrator && <>
            <Button onClick={() => setEditOperatorIsOpen(true)} disabled={isPending}>
              <PencilIcon /> Edit operator
            </Button>
          </>
        }
        {
          !isPending && !ownedArbitrator && <Button onClick={() => navigate("/register-arbitrator")}>Register arbitrator</Button>
        }
      </PageTitleRow>
      {isPending && <Loading />}
      {
        !isPending && <>
          {ownedArbitrator && <ArbitratorPreview arbitrator={ownedArbitrator} />}
          {!ownedArbitrator && <div>No arbitrator owned yet</div>}
        </>
      }

      <EditOperatorDialog arbitrator={ownedArbitrator} isOpen={editOperatorIsOpen} onHandleClose={() => setEditOperatorIsOpen(false)} />
    </PageContainer>
  );
}


export default ArbitratorDashboard;