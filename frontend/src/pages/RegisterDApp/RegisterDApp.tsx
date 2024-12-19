import { useState, FC } from 'react';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { PageTitle } from '@/components/base/PageTitle';
import { useDappRegistryContract } from '@/services/dapp-registry/hooks/useDappRegistryContract';
import { isAddress } from 'viem';
import { EnsureWalletNetwork } from '@/components/EnsureWalletNetwork/EnsureWalletNetwork';
import { Button } from '@/components/ui/button';
import { useToasts } from '@/services/ui/hooks/useToasts';
import { Input } from '@/components/ui/input';

const RegisterDApp: FC = () => {
  const { evmAccount } = useWalletContext();
  const [dappAddress, setDappAddress] = useState('');
  const [registrationFee] = useState('1'); // 1 ELA
  const { errorToast } = useToasts();
  const { register, isPending, isSuccess, error } = useDappRegistryContract(dappAddress, registrationFee);

  const handleRegisterDApp = async () => {
    if (!evmAccount) {
      errorToast('Please connect your wallet first');
      return;
    }

    if (!dappAddress || !isAddress(dappAddress)) {
      errorToast('Please enter a valid DApp address');
      return;
    }

    try {
      await register();
    } catch (error) {
      errorToast(`Error registering DApp: ${error}`);
    }
  };

  return (
    <div className="container space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <PageTitle className="flex flex-grow sm:flex-grow-0">Register DApp</PageTitle>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">
              Registration Fee: {registrationFee} ELA
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
                disabled={isPending || !dappAddress}
              >
                {isPending ? 'Registering...' : 'Register'}
              </Button>
            </EnsureWalletNetwork>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterDApp;