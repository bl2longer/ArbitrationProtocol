import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArbiterStakingEditor } from "@/pages/ArbiterDashboard/dialogs/ArbiterStakingEditor/ArbiterStakingEditor";
import { useArbiterOperatorUpdate } from "@/services/arbiters/hooks/contract/useArbiterOperatorUpdate";
import { ArbiterInfo } from "@/services/arbiters/model/arbiter-info";
import { useToasts } from "@/services/ui/hooks/useToasts";
import { FC } from "react";

export const EditStakingDialog: FC<{
  arbiter: ArbiterInfo;
  isOpen: boolean;
  onHandleClose: () => void;
}> = ({ arbiter, isOpen, onHandleClose, ...rest }) => {
  const { isPending, updateOperatorInfo } = useArbiterOperatorUpdate();
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

  if (!arbiter)
    return null;

  return (
    <Dialog {...rest} open={isOpen} onOpenChange={onHandleClose}>
      <DialogContent aria-description="Edit Arbiter Staking">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Edit Arbiter Staking</DialogTitle>
          <DialogDescription>Increase stake, or withdrawn everything, from your arbiter.</DialogDescription>
        </DialogHeader>

        <ArbiterStakingEditor onOperationComplete={onHandleClose} />
      </DialogContent>
    </Dialog>
  )
}