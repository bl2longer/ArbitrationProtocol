import { FC } from 'react';
import { PageTitle } from '@/components/base/PageTitle';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { ArbitratorStaking } from '@/components/arbitration/ArbitratorStaking/ArbitratorStaking';
import { useOwnedArbitrator } from '@/services/arbitrators/hooks/useOwnedArbitrator';

const RegisterArbitrator: FC = () => {
  const { ownedArbitrator, isPending } = useOwnedArbitrator();

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>Register as Arbitrator</PageTitle>
      </PageTitleRow>

      <div className="flex items-center justify-center">
        <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
          {!isPending && !ownedArbitrator && <ArbitratorStaking />}
          {!isPending && ownedArbitrator && <div className='text-center'>An arbitrator is already registered<br />for this wallet address.</div>}
        </div>
      </div>
    </PageContainer >
  );
}

export default RegisterArbitrator;