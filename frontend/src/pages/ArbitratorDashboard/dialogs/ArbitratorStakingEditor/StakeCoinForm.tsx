import { useMemo, FC, useCallback } from 'react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useArbitratorStake } from '@/services/arbitrators/hooks/contract/useArbitratorStake';
import { useConfigManager } from '@/services/config-manager/hooks/useConfigManager';

export const StakeCoinForm: FC<{
  actionLabel: string;
  onStaked: () => void;
}> = ({ actionLabel, onStaked }) => {
  const activeChain = useActiveEVMChainConfig();
  const { configSettings } = useConfigManager();
  const { stakeETH, isPending: isRegistering } = useArbitratorStake();

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
      console.error('Error during arbitrator registration:', error);
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
