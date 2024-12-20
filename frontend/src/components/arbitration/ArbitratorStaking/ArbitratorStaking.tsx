import { useState, useEffect, useMemo, FC, useCallback } from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { StakeType, StakeTypePicker } from '@/components/arbitration/ArbitratorStaking/StakeTypePicker';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useConfigManagerSettings } from '@/services/config-manager/hooks/contract/useConfigManagerSettings';
import { useArbitratorRegister } from '@/services/arbitrators/hooks/contract/useArbitratorRegister';
import { useToasts } from '@/services/ui/hooks/useToasts';
import { useNavigate } from 'react-router-dom';
import { useOwnedArbitrator } from '@/services/arbitrators/hooks/useOwnedArbitrator';
import { ArbitratorInfo } from '@/services/arbitrators/model/arbitrator-info';

/**
 * Component used both to register an arbitrator, and to manage staking, as 
 * registering an arbitrator is basically creating a first stake (contract design).
 */
export const ArbitratorStaking: FC<{
  arbitrator?: ArbitratorInfo; // Edited arbitrator (not used for initia lregistration)
}> = ({ arbitrator }) => {
  const isEditMode = !!arbitrator; // We are in staking edition mode if an arbitrator is passed.
  const activeChain = useActiveEVMChainConfig();
  const { successToast } = useToasts();
  const navigate = useNavigate();
  const [stakeType, setStakeType] = useState<StakeType>("coin");
  const [nftAddress, setNftAddress] = useState('');
  const [tokenIds, setTokenIds] = useState('');
  const { fetchAllSettings, configManagerSettings, isSuccess: configManagerSettingFetched } = useConfigManagerSettings();
  const { stakeETH, isPending: isRegistering } = useArbitratorRegister();

  useEffect(() => {
    void fetchAllSettings();
  }, [fetchAllSettings]);
  // Forms
  const stakeCoinFormSchema = useMemo(() => z.object({
    coinAmount: z.coerce.number()
      .min(Number(configManagerSettings?.minStake))
      .max(Number(configManagerSettings?.maxStake))
  }), [configManagerSettings]);
  const nativeCoinForm = useForm<z.infer<typeof stakeCoinFormSchema>>({
    resolver: zodResolver(stakeCoinFormSchema),
    defaultValues: {
      coinAmount: 1,
    }
  });

  const handleArbitratorRegistration = useCallback(async (values: z.infer<typeof stakeCoinFormSchema>) => {
    try {
      if (stakeType === 'coin') {
        if (await stakeETH(BigInt(values.coinAmount))) {
          successToast(`Arbitrator successfully registered!`);
          // Back to arbitrators list.
          navigate("/arbitrators");
        }
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
  }, [navigate, stakeETH, stakeType, successToast]);


  return (
    <div>
      {
        isEditMode && <div>Current stake: {Number(arbitrator.ethAmount)}</div>
      }

      <StakeTypePicker value={stakeType} onChange={setStakeType} />

      <Form {...nativeCoinForm}>
        <form onSubmit={nativeCoinForm.handleSubmit(handleArbitratorRegistration)}>
          {stakeType === "coin" ? (
            <FormField
              control={nativeCoinForm.control}
              name="coinAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of {activeChain.nativeCurrency.symbol}</FormLabel>
                  <Input type='number' step="1" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <EnsureWalletNetwork continuesTo='Register'>
              <Button
                type="submit"
                disabled={!configManagerSettingFetched || isRegistering}
                className={!nativeCoinForm.formState.isValid && "opacity-30"}>
                Register
              </Button>
            </EnsureWalletNetwork>
          </div>
        </form>
      </Form>
    </div>
  )
}