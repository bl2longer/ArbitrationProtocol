import { useState, useEffect, useMemo, FC, useCallback } from 'react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { StakeType, StakeTypePicker } from '@/components/staking/StakeTypePicker';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useConfigManagerSettings } from '@/services/config-manager/hooks/contract/useConfigManagerSettings';
import { useArbitratorStake } from '@/services/arbitrators/hooks/contract/useArbitratorStake';
import { useToasts } from '@/services/ui/hooks/useToasts';
import { useNavigate } from 'react-router-dom';
import { ArbitratorInfo } from '@/services/arbitrators/model/arbitrator-info';
import { useConfigManager } from '@/services/config-manager/hooks/useConfigManager';

export const StakeNFTForm: FC = () => {
  const { successToast } = useToasts();
  const navigate = useNavigate();
  const [nftAddress, setNftAddress] = useState('');
  const [tokenIds, setTokenIds] = useState('');
  const { configSettings } = useConfigManager();

  // Form
  const stakeNFTFormSchema = useMemo(() => z.object({
    coinAmount: z.coerce.number()
      .min(Number(configSettings?.minStake))
      .max(Number(configSettings?.maxStake))
  }), [configSettings]);
  const nftForm = useForm<z.infer<typeof stakeNFTFormSchema>>({
    resolver: zodResolver(stakeNFTFormSchema),
    defaultValues: {
      coinAmount: 1,
    }
  });

  const handleStakeNFT = useCallback((values: z.infer<typeof stakeNFTFormSchema>) => {
    try {
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
    } catch (error) {
      console.error('Error during arbitrator registration:', error);
    }
  }, []);

  // TODO: FORM

  return (
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
  )
}