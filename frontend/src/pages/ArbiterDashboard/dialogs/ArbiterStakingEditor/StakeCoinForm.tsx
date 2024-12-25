import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useArbiterStake } from '@/services/arbiters/hooks/contract/useArbiterStake';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useConfigManager } from '@/services/config-manager/hooks/useConfigManager';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const StakeCoinForm: FC<{
  actionLabel: string;
  onStaked: () => void;
}> = ({ actionLabel, onStaked }) => {
  const activeChain = useActiveEVMChainConfig();
  const { configSettings } = useConfigManager();
  const { stakeETH, isPending: isRegistering } = useArbiterStake();

  const stakeCoinFormSchema = useMemo(() => z.object({
    coinAmount: z.coerce.number().min(Number(configSettings?.minStake)).max(Number(configSettings?.maxStake))
  }), [configSettings]);

  const nativeCoinForm = useForm<z.infer<typeof stakeCoinFormSchema>>({
    resolver: zodResolver(stakeCoinFormSchema),
    defaultValues: {
      coinAmount: 1,
    }
  });

  const handleStake = useCallback(async (values: z.infer<typeof stakeCoinFormSchema>) => {
    try {
      if (await stakeETH(BigInt(values.coinAmount))) {
        onStaked();
      }
    } catch (error) {
      console.error('Error during arbiter registration:', error);
    }
  }, [onStaked, stakeETH]);

  return (
    <Form {...nativeCoinForm}>
      <form onSubmit={nativeCoinForm.handleSubmit(handleStake)}>
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
        <div className="mt-6 flex justify-end space-x-3">
          <EnsureWalletNetwork continuesTo='Register'>
            <Button
              type="submit"
              disabled={!configSettings || isRegistering}
              className={!nativeCoinForm.formState.isValid && "opacity-30"}>
              {actionLabel}
            </Button>
          </EnsureWalletNetwork>
        </div>
      </form>
    </Form>
  )
}
