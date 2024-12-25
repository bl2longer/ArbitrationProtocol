import { PageContainer } from '@/components/base/PageContainer';
import { PageTitle } from '@/components/base/PageTitle';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { useOwnedArbiter } from '@/services/arbiters/hooks/useOwnedArbiter';
import { FC } from 'react';
import { RegistrationForm } from './components/RegistrationForm';

const RegisterArbiter: FC = () => {
  const { ownedArbiter, isPending } = useOwnedArbiter();

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle>Register as Arbiter</PageTitle>
      </PageTitleRow>

      <div className="flex items-center justify-center">
        {!isPending && !ownedArbiter && <RegistrationForm />}

        {!isPending && ownedArbiter &&
          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className='text-center'>An arbiter is already registered<br />for this wallet address.</div>
          </div>
        }
      </div>
    </PageContainer >
  );
}

export default RegisterArbiter;