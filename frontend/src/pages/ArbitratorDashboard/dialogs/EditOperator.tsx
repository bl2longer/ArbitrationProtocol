import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useArbitratorOperatorUpdate } from "@/services/arbitrators/hooks/contract/useArbitratorOperatorUpdate";
import { ArbitratorInfo } from "@/services/arbitrators/model/arbitrator-info";
import { useResetFormOnOpen } from "@/services/ui/hooks/useResetFormOnOpen";
import { useToasts } from "@/services/ui/hooks/useToasts";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";

const formSchema = z.object({
  operatorEVMAddress: z.string().refine(
    (value) => isAddress(value),
    "Not a valid EVM address"
  ),
  operatorBTCAddress: z.string(),
  operatorBTCPubKey: z.string()
});

export const EditOperatorDialog: FC<{
  arbitrator: ArbitratorInfo;
  isOpen: boolean;
  onHandleClose: () => void;
}> = ({ arbitrator, isOpen, onHandleClose, ...rest }) => {
  const { isPending, updateOperatorInfo } = useArbitratorOperatorUpdate();
  const { successToast } = useToasts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatorEVMAddress: arbitrator?.operatorEvmAddress as any || '',
      operatorBTCAddress: arbitrator?.operatorBtcAddress || '',
      operatorBTCPubKey: arbitrator?.operatorBtcPubKey || '',
    },
  });

  // Reset default form values every time the dialog reopens
  useResetFormOnOpen(isOpen, form);

  const handlePublish = useCallback(async (values: z.infer<typeof formSchema>) => {
    if (await updateOperatorInfo(values.operatorEVMAddress, values.operatorBTCAddress, values.operatorBTCPubKey)) {
      successToast(`Operator information successfully updated!`);

      // Update local model
      arbitrator.operatorEvmAddress = values.operatorEVMAddress;
      arbitrator.operatorBtcAddress = values.operatorBTCAddress;
      arbitrator.operatorBtcPubKey = values.operatorBTCPubKey;

      onHandleClose();
    }
  }, [updateOperatorInfo, successToast, arbitrator, onHandleClose]);

  if (!arbitrator)
    return null;

  return (
    <Dialog {...rest} open={isOpen} onOpenChange={onHandleClose}>
      <DialogContent aria-description="Edit Arbitrator Operator">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Edit Arbitrator Operator</DialogTitle>
          <DialogDescription>The operator is the entity who manages arbitrator operations. It's possibly not the creator.</DialogDescription>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePublish)}>
            {/* Operator EVM Address */}
            <FormField control={form.control} name="operatorEVMAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator EVM Address</FormLabel>
                  <Input type='text' {...field} />
                  <FormMessage />
                </FormItem>
              )} />

            {/* Operator BTC Address */}
            <FormField control={form.control} name="operatorBTCAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator BTC Address</FormLabel>
                  <Input type='text' {...field} />
                  <FormMessage />
                </FormItem>
              )} />

            {/* Operator BTC Public Key */}
            <FormField control={form.control} name="operatorBTCPubKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator BTC Public Key</FormLabel>
                  <Input type='text' {...field} />
                  <FormMessage />
                </FormItem>
              )} />

            <DialogFooter className="mt-6">
              <Button type="submit" className={!form.formState.isValid && "opacity-30"} disabled={isPending}>
                Publish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}