import { useState, useEffect, useMemo, FC } from 'react';
import { Dialog } from '@headlessui/react';
import { mockTransactions } from '../../mock/data';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { Transaction } from '@/services/transactions/model/transaction';
import { useTransactions } from '@/services/transactions/hooks/useTransactions';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { PageTitle } from '@/components/PageTitle';
import { SearchInput } from '@/components/SearchInput';

const RegisterDApp: FC = () => {
  const [dappAddress, setDappAddress] = useState('');
  const [registrationFee] = useState('1000000000000000000'); // 1 E

  const handleRegisterDApp = () => {
    //   if (!contract || !dappAddress) return;
    //   try {
    //     // Here we would call the actual contract method
    //     console.log('Registering DApp:', dappAddress);
    //     setIsRegisterDialogOpen(false);
    //     setDappAddress('');
    //   } catch (error) {
    //     console.error('Error registering DApp:', error);
    //   }
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
              Registration Fee: {registrationFee} ETH
            </p>
            <input
              type="text"
              placeholder="DApp Address (0x...)"
              value={dappAddress}
              onChange={(e) => setDappAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={void handleRegisterDApp}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterDApp;