import { EnsureWalletNetwork } from "@/components/base/EnsureWalletNetwork/EnsureWalletNetwork";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useBackendArbiter } from "@/services/arbiter-backend/hooks/useBackendArbiter";
import { ArbiterInfo } from "@/services/arbiters/model/arbiter-info";
import { useSignTypedData } from "@/services/evm/hooks/useSignTypedData";
import { useResetFormOnOpen } from "@/services/ui/hooks/useResetFormOnOpen";
import { useToasts } from "@/services/ui/hooks/useToasts";
import { isValidEmailAddress } from "@/utils/isValidEmailAddress";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const EditNotificationsDialog: FC<{
  arbiter: ArbiterInfo;
  isOpen: boolean;
  onHandleClose: () => void;
  onContractUpdated: () => void;
}> = ({ arbiter, isOpen, onContractUpdated, onHandleClose, ...rest }) => {
  const { successToast, errorToast } = useToasts();
  const { status: backendArbiterStatus, upsertBackendArbiter, isUpserting } = useBackendArbiter(arbiter.address);
  const emailAddresAlreadySet = useMemo(() => backendArbiterStatus?.emailKnown, [backendArbiterStatus]);
  const { requestTypedDataSignature } = useSignTypedData();
  const [willingToUpdateEmail, setWillingToUpdateEmail] = useState(false);
  const [evmSignatureChallenge, setEvmSignatureChallenge] = useState<string>(undefined);
  const [isSigningEvmChallenge, setIsSigningEvmChallenge] = useState(false);

  const formSchema = useMemo(() => z.object({
    email: z.string().refine(isValidEmailAddress, "A valid email address is required"),
  }), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    },
  });

  // Reset default form values every time the dialog reopens
  useResetFormOnOpen(isOpen, form);

  const handleUpdate = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsSigningEvmChallenge(true);
    const { payload, signature } = (await requestTypedDataSignature()) || {};
    setIsSigningEvmChallenge(false);

    if (!signature)
      return;

    if (await upsertBackendArbiter(values.email, payload, signature)) {
      successToast("Email address updated");
      onHandleClose();
    }
    else
      errorToast("Failed to update email address");
  }, [errorToast, successToast, requestTypedDataSignature, upsertBackendArbiter, onHandleClose]);

  useEffect(() => {
    // Reset state on open
    if (isOpen)
      setWillingToUpdateEmail(false);
  }, [isOpen]);

  if (!arbiter)
    return null;

  return (
    <Dialog {...rest} open={isOpen} onOpenChange={onHandleClose}>
      {/* Prevent focus for tooltip not to auto show */}
      <DialogContent aria-description="Edit arbiter Operator" onOpenAutoFocus={e => e.preventDefault()}>
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Edit Notifications</DialogTitle>
          <DialogDescription>
            Provide your email address to receive arbitration request notifications by email every time
            your arbiter get some work to do. You will have to verify your EVM wallet with a simple signature,
            and your email address with a simple PIN code.
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            {/* Email address */}
            {(!emailAddresAlreadySet || willingToUpdateEmail) &&
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <Input type='email' {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            }

            {emailAddresAlreadySet && !willingToUpdateEmail &&
              <>An email address was already configured (hidden for privacy). Would you like to change it?</>
            }

            <DialogFooter className="mt-6">
              <EnsureWalletNetwork continuesTo="Update" evmConnectedNeeded>
                {
                  (!emailAddresAlreadySet || willingToUpdateEmail) &&
                  <Button disabled={isSigningEvmChallenge || isUpserting} type="submit" className={!form.formState.isValid && "opacity-30"}>
                    Update
                  </Button>
                }
                {emailAddresAlreadySet && !willingToUpdateEmail &&
                  <Button type="button" onClick={() => setWillingToUpdateEmail(true)}>
                    Change email address
                  </Button>
                }
              </EnsureWalletNetwork>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}