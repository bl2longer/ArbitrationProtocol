import { FC } from 'react';
import { PageTitle } from '@/components/base/PageTitle';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { useOwnedArbitrator } from '@/services/arbitrators/hooks/useOwnedArbitrator';
import { RegistrationForm } from './components/RegistrationForm';

const RegisterArbitrator: FC = () => {
  const { ownedArbitrator, isPending } = useOwnedArbitrator();

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>Register as Arbitrator</PageTitle>
      </PageTitleRow>

      <div className="flex items-center justify-center">
        {!isPending && !ownedArbitrator && <RegistrationForm />}

        {!isPending && ownedArbitrator &&
          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className='text-center'>An arbitrator is already registered<br />for this wallet address.</div>
          </div>
        }
      </div>
    </PageContainer >
  );
}

export default RegisterArbitrator;