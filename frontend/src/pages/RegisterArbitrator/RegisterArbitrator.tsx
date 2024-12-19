import { useState, useEffect, useMemo, FC } from 'react';
import { PageTitle } from '@/components/base/PageTitle';
import { RadioGroup } from '@headlessui/react';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';

const RegisterArbitrator: FC = () => {
  const [dappAddress, setDappAddress] = useState('');
  const [registrationFee] = useState('1000000000000000000'); // 1 E
  const [stakeType, setStakeType] = useState<'ETH' | 'NFT'>('ETH');
  const [nftAddress, setNftAddress] = useState('');
  const [tokenIds, setTokenIds] = useState('');
  const [ethAmount, setEthAmount] = useState('1'); // Default 1 ETH

  const handleArbitratorRegistration = () => {
    // TODO if (!account || !contract) return;

    try {
      if (stakeType === 'ETH') {
        // Call stakeETH with the specified amount
        // await contract.stakeETH({
        //   value: ethers.parseEther(ethAmount)
        // });
      } else {
        // For NFT staking
        // const nftContract = new ethers.Contract(
        //   nftAddress,
        //   ['function approve(address to, uint256 tokenId)'],
        //   contract.signer
        // );

        // // Convert comma-separated string to array of numbers
        // const tokenIdArray = tokenIds.split(',').map(id => parseInt(id.trim()));

        // // First approve each token
        // for (const tokenId of tokenIdArray) {
        //   await nftContract.approve(contract.address, tokenId);
        // }

        // // Then stake the NFTs
        // await contract.stakeNFT(nftAddress, tokenIdArray);
      }
    } catch (error) {
      console.error('Error during arbitrator registration:', error);
    }
  };

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle className="flex flex-grow sm:flex-grow-0">Register as Arbitrator</PageTitle>
      </PageTitleRow>

      {/* Arbitrator Registration Dialog */}
      <div className="flex items-center justify-center">
        <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
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
              onClick={void handleArbitratorRegistration}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register
            </button>
          </div>
        </div>
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
        </div>
      </div>
    </PageContainer>
  );
}

export default RegisterArbitrator;