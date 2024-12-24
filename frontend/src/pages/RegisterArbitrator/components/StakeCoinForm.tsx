import { useMemo, FC, useCallback } from 'react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useArbitratorStake } from '@/services/arbitrators/hooks/contract/useArbitratorStake';
import { useConfigManager } from '@/services/config-manager/hooks/useConfigManager';

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
