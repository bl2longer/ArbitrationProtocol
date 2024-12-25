import { useState, useEffect, useMemo, FC, useCallback } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EnsureWalletNetwork } from '@/components/base/EnsureWalletNetwork/EnsureWalletNetwork';
import { StakeType, StakeTypePicker } from '@/components/staking/StakeTypePicker';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useToasts } from '@/services/ui/hooks/useToasts';
import { useNavigate } from 'react-router-dom';
import { useConfigManager } from '@/services/config-manager/hooks/useConfigManager';
import { StakeNFTForm } from './StakeNFTForm';
import { StakeCoinForm } from './StakeCoinForm';
import { useArbitratorRegister } from '@/services/arbitrators/hooks/contract/useArbitratorRegister';
import { isAddress } from 'viem';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/shadcn';
import { formatDate } from '@/utils/dates';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { isValidBitcoinAddress, isValidBitcoinPublicKey } from '@/services/btc/btc';
import { IconTooltip } from '@/components/base/IconTooltip';
import { BoxTitle } from '@/components/base/BoxTitle';
import { useBitcoinWalletAction } from '@/services/btc/hooks/useBitcoinWalletAction';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useERC721CheckApproval } from '@/services/erc721/hooks/useERC721CheckApproval';
import { useInterval } from 'usehooks-ts';
import { useERC721Approve } from '@/services/erc721/hooks/useERC721Approve';

export const RegistrationForm: FC<{
  onOperationComplete?: () => void; // A chain operation has just completed (stake, unstake...)
}> = ({ onOperationComplete }) => {
  const activeChain = useActiveEVMChainConfig();
  const [stakeType, setStakeType] = useState<StakeType>("coin");
  const { successToast } = useToasts();
  const navigate = useNavigate();
  const { configSettings } = useConfigManager();
  const { registerArbitratorByStakeETH, registerArbitratorByStakeNFT, isPending: isRegistering } = useArbitratorRegister();
  const { bitcoinAccount } = useWalletContext();
  const { getPublicKey } = useBitcoinWalletAction();
  const { checkApproved, isApproved: nftTransferIsApproved, isPending: isCheckingTransferApproval } = useERC721CheckApproval(activeChain?.contracts.bPoSNFT, activeChain?.contracts.arbitratorManager);
  const { approveNFTTransfer, isPending: isApprovingTokenTransfer } = useERC721Approve(activeChain?.contracts.bPoSNFT, activeChain?.contracts.arbitratorManager);

  useInterval(checkApproved, 3000);

  const baseSchema = z.object({
    operatorBTCAddress: z.string().refine(isValidBitcoinAddress, "Not a valid Bitcoin address"),
    operatorBTCPubKey: z.string().refine(isValidBitcoinPublicKey, "Not a valid Bitcoin public key"),
    feeRate: z.coerce.number().min(1).max(100),
    deadline: z.date().min(new Date()),
    revenueAddress: z.string().refine((value) => isAddress(value), "Not a valid EVM address"),
  });

  const coinSchemaExtension = z.object({
    coinAmount: z.coerce.number().min(Number(configSettings?.minStake)).max(Number(configSettings?.maxStake))
  });

  const nftSchemaExtension = z.object({
    tokenIds: z.array(z.string()).min(1, "Select at least one NFT")
  });

  const formSchema = useMemo(() => {
    let schema = baseSchema;

    if (stakeType === "coin")
      schema = schema.merge(coinSchemaExtension);

    if (stakeType === "nft")
      schema = schema.merge(nftSchemaExtension);

    return schema;
  }, [baseSchema, coinSchemaExtension, nftSchemaExtension, stakeType]);

  type PartialSchema = typeof formSchema & Partial<typeof coinSchemaExtension> & Partial<typeof nftSchemaExtension>;

  const form = useForm<z.infer<PartialSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenueAddress: '0xa20f5A22eF423b0e5c2Db79A5475D9512d989971', // 0x
      operatorBTCAddress: '',
      operatorBTCPubKey: '',
      feeRate: 1,
      deadline: new Date(),
      // Native coin
      coinAmount: 1,
      // NFT
      tokenIds: []
    }
  });

  const handleRegister = useCallback(async (values: z.infer<PartialSchema>) => {
    try {
      if (stakeType === "coin") {
        console.log("Registering arbitrator using native coin stake", values);

        if (await registerArbitratorByStakeETH(
          BigInt(values.coinAmount),
          values.revenueAddress,
          values.operatorBTCAddress,
          values.operatorBTCPubKey,
          BigInt(values.feeRate),
          BigInt(Math.floor(values.deadline.getTime() / 1000))
        )) {
          successToast(`Arbitrator successfully registered!`);
          navigate("/arbitrators"); // Back to arbitrators list.
        }
      }
      else if (stakeType === "nft") {
        console.log("Registering arbitrator using NFT stake", values);

        if (await registerArbitratorByStakeNFT(
          values.tokenIds,
          values.revenueAddress,
          values.operatorBTCAddress,
          values.operatorBTCPubKey,
          BigInt(values.feeRate),
          BigInt(Math.floor(values.deadline.getTime() / 1000))
        )) {
          successToast(`Arbitrator successfully registered!`);
          navigate("/arbitrators"); // Back to arbitrators list.
        }
      }
    } catch (error) {
      console.error('Error during arbitrator registration:', error);
    }
  }, [navigate, registerArbitratorByStakeETH, registerArbitratorByStakeNFT, stakeType, successToast]);

  const handleImportOperatorFromWallet = useCallback(async () => {
    const pubKey = await getPublicKey();

    form.setValue("operatorBTCAddress", bitcoinAccount);
    form.setValue("operatorBTCPubKey", pubKey);

    // Revalidate the form
    void form.trigger();
  }, [bitcoinAccount, getPublicKey, form]);

  const handleApproveNFTTransfer = useCallback(async () => {
    await approveNFTTransfer();
    void checkApproved();
  }, [approveNFTTransfer, checkApproved]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleRegister)} className='flex flex-col gap-4 w-full items-center justify-center'>
        <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <BoxTitle>Settings</BoxTitle>

          {/* Revenue address */}
          <FormField
            control={form.control}
            name="revenueAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Revenue EVM address</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fee rate */}
          <FormField
            control={form.control}
            name="feeRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee rate (1-100%) <IconTooltip tooltip='todo' iconClassName='ml-1' iconSize={12} /></FormLabel>
                <Input type='number' step="0.01" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Deadline */}
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term end</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value, "YYYY/MM/DD")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className='flex items-center justify-between'>
            <BoxTitle>Operator</BoxTitle>
            <EnsureWalletNetwork continuesTo='Import from wallet' btcAccountNeeded>
              <Button type="button" onClick={handleImportOperatorFromWallet}>Import from wallet</Button>
            </EnsureWalletNetwork>
          </div>

          {/* Operator BTC address */}
          <FormField
            control={form.control}
            name="operatorBTCAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operator BTC address</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Operator BTC public key */}
          <FormField
            control={form.control}
            name="operatorBTCPubKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operator BTC public key</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <BoxTitle>Staking</BoxTitle>

          <FormItem>
            <FormLabel>Initial staking type</FormLabel>
            <StakeTypePicker value={stakeType} onChange={setStakeType} canUnstake={false} />
          </FormItem>

          {stakeType === "coin" && <StakeCoinForm form={form} />}
          {stakeType === "nft" && <StakeNFTForm form={form} />}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {nftTransferIsApproved === false && stakeType === "nft" && <EnsureWalletNetwork continuesTo='Approve NFT Transfer'>
            <Button
              type="button"
              onClick={handleApproveNFTTransfer}
              disabled={isApprovingTokenTransfer}>
              Approve NFT Transfer
            </Button>
          </EnsureWalletNetwork>
          }
          {(nftTransferIsApproved === true || stakeType !== "nft") && <EnsureWalletNetwork continuesTo='Register'>
            <Button
              type="submit"
              disabled={!configSettings || isRegistering}
              className={!form.formState.isValid && "opacity-30"}>
              Register
            </Button>
          </EnsureWalletNetwork>
          }
        </div>
      </form>
    </Form>
  )
}

