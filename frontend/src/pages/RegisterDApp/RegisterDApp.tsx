import { useState, FC, useEffect } from 'react';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { PageTitle } from '@/components/base/PageTitle';
import { useDappRegistryRegister } from '@/services/dapp-registry/hooks/contract/useDAppRegistryRegister';
import { isAddress } from 'viem';
import { EnsureWalletNetwork } from '@/components/EnsureWalletNetwork/EnsureWalletNetwork';
import { Button } from '@/components/ui/button';
import { useToasts } from '@/services/ui/hooks/useToasts';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { useDAppRegistryRegistrationFee } from '@/services/dapp-registry/hooks/contract/useDAppRegistryRegistrationFee';
import { useNavigate } from 'react-router-dom';
import { useConfigManagerSettings } from '@/services/config-manager/hooks/contract/useConfigManagerSettings';

const RegisterDApp: FC = () => {
  const { evmAccount } = useWalletContext();
  const navigate = useNavigate();
  const [dappAddress, setDappAddress] = useState('');
  const { errorToast, successToast } = useToasts();
  const { fetchRegistrationFee, registrationFee, isSuccess: registrationFeeKnown } = useDAppRegistryRegistrationFee();
  const { register, isPending: isRegistering, isSuccess, error } = useDappRegistryRegister();

  const handleRegisterDApp = async () => {
    if (!evmAccount) {
      errorToast('Please connect your wallet');
      return;
    }

    if (!dappAddress || !isAddress(dappAddress)) {
      errorToast('Please enter a valid DApp address');
      return;
    }

    try {
      if (await register(dappAddress, registrationFee)) {
        successToast("DApp successfully registered!");

        // Back to dapps list.
        navigate("/dapps");
      }
    } catch (error) {
      errorToast(`Error registering DApp: ${error}`);
    }
  };

  useEffect(() => {
    fetchRegistrationFee();
  }, [])

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle className="flex flex-grow sm:flex-grow-0">Register DApp</PageTitle>
      </PageTitleRow>

      <div className="flex items-center justify-center">
        <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">
              Registration Fee: {registrationFee !== undefined ? `${Number(registrationFee)} ELA` : `...`}
            </p>
            <Input
              type="text"
              placeholder="DApp Address (0x...)"
              value={dappAddress}
              onChange={(e) => setDappAddress(e.target.value)}
            /* className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" */
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error.message}
              </p>
            )}
            {isSuccess && (
              <p className="mt-2 text-sm text-green-600">
                DApp successfully registered!
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <EnsureWalletNetwork continuesTo='Register'>
              <Button
                onClick={() => void handleRegisterDApp()}
                disabled={isRegistering || !dappAddress || !registrationFeeKnown}
              >
                {isRegistering ? 'Registering...' : 'Register'}
              </Button>
            </EnsureWalletNetwork>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default RegisterDApp;