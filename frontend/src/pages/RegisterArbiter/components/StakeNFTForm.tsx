import { BPosNFTSelector } from '@/components/staking/BPosNFTSelector';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useOwnedBPosNFTs } from '@/services/bpos-nfts/hooks/useOwnedBPosNFTs';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useConfigManager } from '@/services/config-manager/hooks/useConfigManager';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useCallback, useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const StakeNFTForm: FC<{
  form: UseFormReturn<{ tokenIds?: string[] }>;
}> = ({ form }) => {
  const activeChain = useActiveEVMChainConfig();
  const { configSettings } = useConfigManager();
  const { ownedBPosNFTs } = useOwnedBPosNFTs();

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

  const handleNFTSelectionChanged = useCallback((nft: any) => {
    form.setValue('tokenIds', nft.map((nft: any) => nft.tokenId));
    void form.trigger('tokenIds');
  }, [form]);

  return (
    <>
      <FormField
        control={form.control}
        name="tokenIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NFTs to stake</FormLabel>
            <BPosNFTSelector onSelectionChanged={handleNFTSelectionChanged} />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}