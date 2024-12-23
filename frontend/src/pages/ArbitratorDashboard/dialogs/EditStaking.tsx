import { ArbitratorStaking } from "@/components/arbitration/ArbitratorStaking/ArbitratorStaking";
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

export const EditStakingDialog: FC<{
  arbitrator: ArbitratorInfo;
  isOpen: boolean;
  onHandleClose: () => void;
}> = ({ arbitrator, isOpen, onHandleClose, ...rest }) => {
  const { isPending, updateOperatorInfo } = useArbitratorOperatorUpdate();
  const { successToast } = useToasts();

  // const handlePublish = useCallback(async (values: z.infer<typeof formSchema>) => {
  //   if (await updateOperatorInfo(values.operatorEVMAddress, values.operatorBTCAddress, values.operatorBTCPubKey)) {
  //     successToast(`Operator information successfully updated!`);

  //     // Update local model
  //     arbitrator.operatorEvmAddress = values.operatorEVMAddress;
  //     arbitrator.operatorBtcAddress = values.operatorBTCAddress;
  //     arbitrator.operatorBtcPubKey = values.operatorBTCPubKey;

  //     onHandleClose();
  //   }
  // }, [updateOperatorInfo, successToast, arbitrator, onHandleClose]);

  if (!arbitrator)
    return null;

  return (
    <Dialog {...rest} open={isOpen} onOpenChange={onHandleClose}>
      <DialogContent aria-description="Edit Arbitrator Staking">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Edit Arbitrator Staking</DialogTitle>
          <DialogDescription>Increase stake, or withdrawn everything, from your arbitrator.</DialogDescription>
        </DialogHeader>

        <ArbitratorStaking arbitrator={arbitrator} onOperationComplete={onHandleClose} />
      </DialogContent>
    </Dialog>
  )
}