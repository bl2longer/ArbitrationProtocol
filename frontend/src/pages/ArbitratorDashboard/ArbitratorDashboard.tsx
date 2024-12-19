import { FC, useState } from 'react';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useEVMContext } from '@/contexts/EVMContext/EVMContext';
import { useOwnedArbitrator } from '@/services/arbitrators/hooks/useOwnedArbitrator';
import { StatusLabel } from '@/components/base/StatusLabel';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { PageTitle } from '@/components/base/PageTitle';
import { Button } from '@/components/ui/button';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ArbitratorPreview } from './ArbitratorPreview';
import { ArbitratorEdit } from './ArbitratorEdit';
import { Loading } from '@/components/base/Loading';
import { useNavigate } from 'react-router-dom';

const ArbitratorDashboard: FC = () => {
  const { evmAccount: account } = useWalletContext();
  const { connect: connectWallet } = useEVMContext();
  const { ownedArbitrator, isPending } = useOwnedArbitrator();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>My arbitrator</PageTitle>
        {
          ownedArbitrator && <>
            <Button onClick={() => setIsEditing(true)} disabled={isPending}>
              {!isEditing && <> <PencilIcon className="h-5 w-5" /> <span>Edit</span></>}
              {isEditing && <> <XMarkIcon className="h-5 w-5" /> <span>Cancel</span></>}
            </Button>
          </>
        }
        {
          !isPending && !ownedArbitrator && <Button onClick={() => navigate("/register-arbitrator")}>Register arbitrator</Button>
        }
      </PageTitleRow>
      {
        isPending && <Loading />
      }
      {
        !isPending && <>
          {
            ownedArbitrator && <>
              {
                isEditing ?
                  <ArbitratorEdit arbitrator={ownedArbitrator} onEditionComplete={() => setIsEditing(false)} /> :
                  <ArbitratorPreview arbitrator={ownedArbitrator} />
              }
            </>
          }
          {
            !ownedArbitrator && <div>No arbitrator owned yet</div>
          }
        </>
      }
    </PageContainer>
  );
}


export default ArbitratorDashboard;