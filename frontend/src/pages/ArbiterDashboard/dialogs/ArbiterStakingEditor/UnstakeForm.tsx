import { EnsureWalletNetwork } from "@/components/base/EnsureWalletNetwork/EnsureWalletNetwork";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { useArbiterUnstake } from "@/services/arbiters/hooks/contract/useArbiterUnstake";
import { useToasts } from "@/services/ui/hooks/useToasts";
import { FC, useCallback } from "react";

export const UnstakeForm: FC<{
  onUnstaked: () => void;
}> = ({ onUnstaked }) => {
  const { successToast } = useToasts();
  const { unstake, isPending } = useArbiterUnstake();

  const handleUnstake = useCallback(async () => {
    if (await unstake()) {
      successToast("Unstaked successfully!");
      onUnstaked();
    }
  }, [unstake, successToast, onUnstaked]);

  return (
    <div className="flex flex-col mt-6">
      <DialogDescription>You are about to remove all previous stake (coins, NFTs) from your arbiter.</DialogDescription>
      <div className="mt-6 flex justify-end space-x-3">
        <EnsureWalletNetwork continuesTo='Register'>
          <Button onClick={handleUnstake} disabled={isPending}>
            Withdraw stake
          </Button>
        </EnsureWalletNetwork>
      </div>
    </div>
  )
}