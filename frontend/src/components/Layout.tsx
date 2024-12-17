import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, RadioGroup } from '@headlessui/react';
import { ethers } from 'ethers';
import { WalletIcon } from '@heroicons/react/24/outline';
import { useEVMContext } from '@/contexts/EVMContext/EVMContext';

// Utility function to safely format ether values
const formatEther = (value: string): string => {
  try {
    return "0"; // TODO
    //return ethers.utils.formatEther(value);
  } catch (error) {
    console.error('Error formatting ether value:', error);
    return '0';
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { account, connect } = useEVMContext();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isArbitratorDialogOpen, setIsArbitratorDialogOpen] = useState(false);
  const [dappAddress, setDappAddress] = useState('');
  const [registrationFee] = useState('1000000000000000000'); // 1 ETH
  const [stakeType, setStakeType] = useState<'ETH' | 'NFT'>('ETH');
  const [nftAddress, setNftAddress] = useState('');
  const [tokenIds, setTokenIds] = useState('');
  const [ethAmount, setEthAmount] = useState('1'); // Default 1 ETH

  /* const handleRegisterDApp = async () => {
    if (!contract || !dappAddress) return;
    try {
      // Here we would call the actual contract method
      console.log('Registering DApp:', dappAddress);
      setIsRegisterDialogOpen(false);
      setDappAddress('');
    } catch (error) {
      console.error('Error registering DApp:', error);
    }
  };

  const handleArbitratorRegistration = async () => {
    if (!account || !contract) return;

    try {
      if (stakeType === 'ETH') {
        // Call stakeETH with the specified amount
        await contract.stakeETH({
          value: ethers.parseEther(ethAmount)
        });
      } else {
        // For NFT staking
        const nftContract = new ethers.Contract(
          nftAddress,
          ['function approve(address to, uint256 tokenId)'],
          contract.signer
        );

        // Convert comma-separated string to array of numbers
        const tokenIdArray = tokenIds.split(',').map(id => parseInt(id.trim()));

        // First approve each token
        for (const tokenId of tokenIdArray) {
          await nftContract.approve(contract.address, tokenId);
        }

        // Then stake the NFTs
        await contract.stakeNFT(nftAddress, tokenIdArray);
      }
      setIsArbitratorDialogOpen(false);
    } catch (error) {
      console.error('Error during arbitrator registration:', error);
    }
  }; */

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Arbitration Protocol</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/arbitrators"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Arbitrators
                </Link>
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/transactions"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Transactions
                </Link>
                <Link
                  to="/compensations"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Compensations
                </Link>
                <button
                  onClick={() => setIsRegisterDialogOpen(true)}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Register DApp
                </button>
                <button
                  onClick={() => setIsArbitratorDialogOpen(true)}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Register Arbitrator
                </button>
              </div>
            </div>
            <div className="flex items-center">
              {account ? (
                <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              ) : (
                <button
                  onClick={connect}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <WalletIcon className="h-5 w-5 mr-2" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Register DApp Dialog */}
      <Dialog
        open={isRegisterDialogOpen}
        onClose={() => setIsRegisterDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Register DApp
            </Dialog.Title>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Registration Fee: {formatEther(registrationFee)} ETH
              </p>
              <input
                type="text"
                placeholder="DApp Address (0x...)"
                value={dappAddress}
                onChange={(e) => setDappAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsRegisterDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              {/*  <button
                onClick={handleRegisterDApp}
                disabled={!dappAddress}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register
              </button> */}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Arbitrator Registration Dialog */}
      {/* <Dialog
        open={isArbitratorDialogOpen}
        onClose={() => setIsArbitratorDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-medium mb-4">
              Register as Arbitrator
            </Dialog.Title>

            <RadioGroup value={stakeType} onChange={setStakeType} className="mb-4">
              <RadioGroup.Label className="text-sm font-medium text-gray-700">
                Select Stake Type
              </RadioGroup.Label>
              <div className="mt-2 space-y-2">
                <RadioGroup.Option value="ETH" className="flex items-center">
                  {({ checked }) => (
                    <div className={`${checked ? 'bg-blue-50' : ''} p-2 rounded-lg flex items-center w-full`}>
                      <input type="radio" checked={checked} className="mr-2" readOnly />
                      <span>Stake ETH</span>
                    </div>
                  )}
                </RadioGroup.Option>
                <RadioGroup.Option value="NFT" className="flex items-center">
                  {({ checked }) => (
                    <div className={`${checked ? 'bg-blue-50' : ''} p-2 rounded-lg flex items-center w-full`}>
                      <input type="radio" checked={checked} className="mr-2" readOnly />
                      <span>Stake NFT</span>
                    </div>
                  )}
                </RadioGroup.Option>
              </div>
            </RadioGroup>

            {stakeType === 'ETH' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  ETH Amount
                </label>
                <input
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter ETH amount"
                />
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    NFT Contract Address
                  </label>
                  <input
                    type="text"
                    value={nftAddress}
                    onChange={(e) => setNftAddress(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter NFT contract address"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Token IDs (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tokenIds}
                    onChange={(e) => setTokenIds(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 1,2,3"
                  />
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsArbitratorDialogOpen(false)}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleArbitratorRegistration}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </Dialog> */}
    </div>
  );
}
