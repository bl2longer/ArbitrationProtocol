import { BPosNFTSelector } from '@/components/staking/BPosNFTSelector';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BPosNFT } from '@/services/bpos-nfts/model/bpos-nft';
import { FC, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const StakeNFTForm: FC<{
  form: UseFormReturn<{ tokenIds?: string[] }>;
  onNFTSelectionChanged: (nft: BPosNFT[]) => void;
}> = ({ form, onNFTSelectionChanged }) => {

  const handleNFTSelectionChanged = useCallback((nfts: BPosNFT[]) => {
    form.setValue('tokenIds', nfts.map((nft: any) => nft.tokenId));
    void form.trigger('tokenIds');
    onNFTSelectionChanged(nfts);
  }, [form, onNFTSelectionChanged]);

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