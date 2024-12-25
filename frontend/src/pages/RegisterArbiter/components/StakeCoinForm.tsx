import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const StakeCoinForm: FC<{
  form: UseFormReturn<{ coinAmount?: number }>;
}> = ({ form }) => {
  const activeChain = useActiveEVMChainConfig();

  return (
    <>
      <FormField
        control={form.control}
        name="coinAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of {activeChain.nativeCurrency.symbol}</FormLabel>
            <Input type='number' step="1" {...field} />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
