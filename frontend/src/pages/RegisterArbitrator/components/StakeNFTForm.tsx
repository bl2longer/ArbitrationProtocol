import { useState, useEffect, useMemo, FC, useCallback } from 'react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { StakeType, StakeTypePicker } from '@/components/staking/StakeTypePicker';
import { useForm, UseFormReturn } from 'react-hook-form';
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
import { useOwnedBPosNFTs } from '@/services/bpos-nfts/hooks/useOwnedBPosNFTs';
import { BPosNFTSelector } from '@/components/staking/BPosNFTSelector';

export const StakeNFTForm: FC<{
  form: UseFormReturn<{ tokenIds?: string[] }>;
}> = ({ form }) => {
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