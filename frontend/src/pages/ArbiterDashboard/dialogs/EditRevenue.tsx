import { EnsureWalletNetwork } from "@/components/base/EnsureWalletNetwork/EnsureWalletNetwork";
import { IconTooltip } from "@/components/base/IconTooltip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { tooltips } from "@/config/tooltips";
import { useArbiterRevenueUpdate } from "@/services/arbiters/hooks/contract/useArbiterRevenueUpdate";
import { ArbiterInfo } from "@/services/arbiters/model/arbiter-info";
import { isValidBitcoinAddress, isValidBitcoinPublicKey } from "@/services/btc/btc";
import { useResetFormOnOpen } from "@/services/ui/hooks/useResetFormOnOpen";
import { useToasts } from "@/services/ui/hooks/useToasts";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";

export const EditRevenueDialog: FC<{
  arbiter: ArbiterInfo;
  isOpen: boolean;
  onHandleClose: () => void;
}> = ({ arbiter, isOpen, onHandleClose, ...rest }) => {
  const { isPending, updateRevenueInfo } = useArbiterRevenueUpdate();
  const { successToast } = useToasts();

  const formSchema = useMemo(() => z.object({
    revenueEVMAddress: z.string().refine((value) => isAddress(value), "Not a valid EVM address"),
    revenueBTCAddress: z.string().refine(isValidBitcoinAddress, "Not a valid Bitcoin address"),
    revenueBTCPubKey: z.string().refine(isValidBitcoinPublicKey, "Not a valid Bitcoin public key"),
  }), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenueEVMAddress: arbiter?.revenueEvmAddress as any || '',
      revenueBTCAddress: arbiter?.revenueBtcAddress || '',
      revenueBTCPubKey: arbiter?.revenueBtcPubKey || '',
    },
  });

  // Reset default form values every time the dialog reopens
  useResetFormOnOpen(isOpen, form);

  const handlePublish = useCallback(async (values: z.infer<typeof formSchema>) => {
    if (await updateRevenueInfo(values.revenueEVMAddress, values.revenueBTCAddress, values.revenueBTCPubKey)) {
      successToast(`Revenue information successfully updated!`);

      // Update local model
      arbiter.revenueEvmAddress = values.revenueEVMAddress;
      arbiter.revenueBtcAddress = values.revenueBTCAddress;
      arbiter.revenueBtcPubKey = values.revenueBTCPubKey;

      onHandleClose();
    }
  }, [updateRevenueInfo, successToast, arbiter, onHandleClose]);

  if (!arbiter)
    return null;

  return (
    <Dialog {...rest} open={isOpen} onOpenChange={onHandleClose}>
      <DialogContent aria-description="Edit arbiter Revenue">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Edit Arbiter Revenue</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePublish)}>
            {/* Revenue EVM Address */}
            <FormField control={form.control} name="revenueEVMAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenue EVM Address <IconTooltip title="Revenue address" tooltip={tooltips.revenueAddress} iconClassName='ml-1' iconSize={12} /></FormLabel>
                  <Input type='text' {...field} />
                  <FormMessage />
                </FormItem>
              )} />

            {/* Revenue BTC Address */}
            <FormField control={form.control} name="revenueBTCAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenue BTC Address</FormLabel>
                  <Input type='text' {...field} />
                  <FormMessage />
                </FormItem>
              )} />

            {/* Revenue BTC Public Key */}
            <FormField control={form.control} name="revenueBTCPubKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenue BTC Public Key</FormLabel>
                  <Input type='text' {...field} />
                  <FormMessage />
                </FormItem>
              )} />

            <DialogFooter className="mt-6">
              <EnsureWalletNetwork continuesTo="Update" evmConnectedNeeded>
                <Button type="submit" className={!form.formState.isValid && "opacity-30"} disabled={isPending}>
                  Update
                </Button>
              </EnsureWalletNetwork>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}