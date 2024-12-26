import { EnsureWalletNetwork } from "@/components/base/EnsureWalletNetwork/EnsureWalletNetwork";
import { IconTooltip } from "@/components/base/IconTooltip";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { tooltips } from "@/config/tooltips";
import { useArbiterParamsUpdate } from "@/services/arbiters/hooks/contract/useArbiterParamsUpdate";
import { ArbiterInfo } from "@/services/arbiters/model/arbiter-info";
import { useResetFormOnOpen } from "@/services/ui/hooks/useResetFormOnOpen";
import { useToasts } from "@/services/ui/hooks/useToasts";
import { formatDate } from "@/utils/dates";
import { cn } from "@/utils/shadcn";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import moment from "moment";
import { FC, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const EditSettingsDialog: FC<{
  arbiter: ArbiterInfo;
  isOpen: boolean;
  onHandleClose: () => void;
}> = ({ arbiter, isOpen, onHandleClose, ...rest }) => {
  const { isPending, updateParams } = useArbiterParamsUpdate();
  const { successToast } = useToasts();

  const formSchema = useMemo(() => z.object({
    feeRate: z.coerce.number().min(1).max(100),
    deadline: z.date().min(new Date()),
  }), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feeRate: arbiter.currentFeeRate / 100,
      deadline: arbiter.lastArbitrationTime ? moment.unix(arbiter.lastArbitrationTime).toDate() : new Date(),
    },
  });

  // Reset default form values every time the dialog reopens
  useResetFormOnOpen(isOpen, form);

  const handlePublish = useCallback(async (values: z.infer<typeof formSchema>) => {
    if (await updateParams(
      values.feeRate,
      BigInt(Math.floor(values.deadline.getTime() / 1000))
    )) {
      successToast(`Arbiter settings successfully updated!`);

      // Update local model
      arbiter.currentFeeRate = values.feeRate;
      arbiter.lastArbitrationTime = values.deadline.getTime() / 1000;

      onHandleClose();
    }
  }, [updateParams, successToast, arbiter, onHandleClose]);

  if (!arbiter)
    return null;

  return (
    <Dialog {...rest} open={isOpen} onOpenChange={onHandleClose}>
      {/* Prevent focus for tooltip not to auto show */}
      <DialogContent aria-description="Edit arbiter Operator" onOpenAutoFocus={e => e.preventDefault()}>
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Edit Arbiter Settings</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePublish)}>
            {/* Fee rate */}
            <FormField
              control={form.control}
              name="feeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee rate (1-100%) <IconTooltip title="Fee rate" tooltip={tooltips.arbiterFeeRate} iconClassName='ml-1' iconSize={12} /></FormLabel>
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
                  <FormLabel>Term end <IconTooltip title="Term end" tooltip={tooltips.arbiterDeadline} iconClassName='ml-1' iconSize={12} /></FormLabel>
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
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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