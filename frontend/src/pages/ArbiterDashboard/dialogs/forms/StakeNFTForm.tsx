import { BPosNFTSelector } from '@/components/staking/BPosNFTSelector';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FC, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const StakeNFTForm: FC<{
  form: UseFormReturn<{ tokenIds?: string[] }>;
}> = ({ form }) => {

  const handleNFTSelectionChanged = useCallback((nft: any) => {
    form.setValue('tokenIds', nft.map((nft: any) => nft.tokenId));
    void form.trigger('tokenIds');
  }, [form]);

  return (
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
  )
}