import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { Loading } from '@/components/base/Loading';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitle } from '@/components/base/PageTitle';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { Button } from '@/components/ui/button';
import { useArbiterPause } from '@/services/arbiters/hooks/contract/useArbiterPause';
import { useArbiterResume } from '@/services/arbiters/hooks/contract/useArbiterResume';
import { useOwnedArbiter } from '@/services/arbiters/hooks/useOwnedArbiter';
import { RefreshCwIcon } from 'lucide-react';
import { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArbiterPreview } from './ArbiterPreview';

const ArbiterDashboard: FC = () => {
  const { fetchOwnedArbiter, ownedArbiter, isPending } = useOwnedArbiter();
  const navigate = useNavigate();
  const { pauseArbiter, isPending: isPausing } = useArbiterPause();
  const { resumeArbiter, isPending: isResuming } = useArbiterResume();

  const handlePauseArbiter = useCallback(async () => {
    await pauseArbiter();
    void fetchOwnedArbiter();
  }, [fetchOwnedArbiter, pauseArbiter]);

  const handleResumeArbiter = useCallback(async () => {
    await resumeArbiter();
    void fetchOwnedArbiter();
  }, [fetchOwnedArbiter, resumeArbiter]);

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>My arbiter</PageTitle>
        <div className='flex gap-4'>
          <Button variant="outline" size="icon" onClick={fetchOwnedArbiter}>
            <RefreshCwIcon />
          </Button>
          {
            !isPending && !ownedArbiter &&
            <EnsureWalletNetwork continuesTo='Register Arbiter'>
              <Button onClick={() => navigate("/register-arbiter")}>Register arbiter</Button>
            </EnsureWalletNetwork>
          }
          {
            !isPending && ownedArbiter && !ownedArbiter.isPaused() &&
            <EnsureWalletNetwork continuesTo='Pause'>
              <Button onClick={handlePauseArbiter} disabled={isPausing}>Pause</Button>
            </EnsureWalletNetwork>
          }
          {
            !isPending && ownedArbiter && ownedArbiter.isPaused() &&
            <EnsureWalletNetwork continuesTo='Resume'>
              <Button onClick={handleResumeArbiter} disabled={isResuming}>Resume</Button>
            </EnsureWalletNetwork>
          }
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