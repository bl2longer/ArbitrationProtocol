import { BoxTitle } from "@/components/base/BoxTitle";
import { EnsureWalletNetwork } from "@/components/base/EnsureWalletNetwork/EnsureWalletNetwork";
import { StatusLabel } from "@/components/base/StatusLabel";
import { Button } from "@/components/ui/button";
import { arbiterStatusLabelColor } from "@/services/arbiters/arbiters.service";
import { useOwnedArbiter } from "@/services/arbiters/hooks/useOwnedArbiter";
import { ArbiterInfo } from "@/services/arbiters/model/arbiter-info";
import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useDynamicAddressFormat } from "@/services/ui/hooks/useDynamicAddressFormat";
import { formatDate } from "@/utils/dates";
import { DollarSignIcon, Layers2Icon, SettingsIcon, StarIcon } from "lucide-react";
import { FC, ReactNode, useCallback, useState } from "react";
import { EditOperatorDialog } from "./dialogs/EditOperator";
import { EditRevenueDialog } from "./dialogs/EditRevenue";
import { EditSettingsDialog } from "./dialogs/EditSettings";
import { EditStakingDialog } from "./dialogs/EditStaking";

const InfoRow: FC<{
  title: string;
  value: ReactNode;
}> = ({ title, value }) => {
  return <div className="p-4 space-y-2">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="font-mono">{value}</div>
  </div>
}

export const ArbiterPreview: FC<{
  arbiter: ArbiterInfo;
}> = ({ arbiter }) => {
  const termEnd = arbiter.getTermEndDate();
  const activeChain = useActiveEVMChainConfig();
  const { dynamicAddressFormat } = useDynamicAddressFormat();
  const [editSettingsIsOpen, setEditSettingsIsOpen] = useState(false);
  const [editOperatorIsOpen, setEditOperatorIsOpen] = useState(false);
  const [editStakingIsOpen, setEditStakingIsOpen] = useState(false);
  const [editRevenueIsOpen, setEditRevenueIsOpen] = useState(false);
  const { fetchOwnedArbiter } = useOwnedArbiter();

  const handleArbiterUpdated = useCallback(() => {
    void fetchOwnedArbiter();
  }, [fetchOwnedArbiter]);

  return (
    <div className="space-y-6">
      {/* Fixed info */}
      <div className="bg-white rounded-lg shadow divide-y">
        <InfoRow title="Address" value={dynamicAddressFormat(arbiter.address)} />
        <InfoRow title="Status" value={<StatusLabel
          title={arbiter.status}
          color={arbiterStatusLabelColor(arbiter)}
        />} />
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        <div className='flex justify-between items-center mx-4 py-2'>
          <BoxTitle>Stake</BoxTitle>
          <EnsureWalletNetwork continuesTo="Edit" evmConnectedNeeded supportedNetworkNeeded>
            <Button onClick={() => setEditStakingIsOpen(true)}><Layers2Icon />Edit</Button>
          </EnsureWalletNetwork>
        </div>
        <InfoRow title="Stake Amount" value={`
          ${arbiter.getTotalValue().toString()} ${activeChain?.nativeCurrency.symbol}
          (${arbiter.ethAmount.toString()} ${activeChain?.nativeCurrency.symbol} in native coins, ${arbiter.nftValue.toString()} ${activeChain?.nativeCurrency.symbol} in NFTs)
          `} />
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        <div className='flex justify-between items-center mx-4 py-2'>
          <BoxTitle>Main Settings</BoxTitle>
          <EnsureWalletNetwork continuesTo="Edit" evmConnectedNeeded supportedNetworkNeeded>
            <Button onClick={() => setEditSettingsIsOpen(true)}><SettingsIcon />Edit</Button>
          </EnsureWalletNetwork>
        </div>
        <InfoRow title="Fee Rate" value={`${arbiter.currentFeeRate / 100}%`} />
        <InfoRow title="Term End" value={termEnd ? formatDate(termEnd) : "-"} />
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        <div className='flex justify-between items-center mx-4 py-2'>
          <BoxTitle>Operator</BoxTitle>
          <EnsureWalletNetwork continuesTo="Edit" evmConnectedNeeded supportedNetworkNeeded>
            <Button onClick={() => setEditOperatorIsOpen(true)}><StarIcon />Edit</Button>
          </EnsureWalletNetwork>
        </div>
        <InfoRow title="EVM Address" value={dynamicAddressFormat(arbiter.operatorEvmAddress) || "-"} />
        <InfoRow title="BTC Address" value={dynamicAddressFormat(arbiter.operatorBtcAddress) || "-"} />
        <InfoRow title="BTC Public Key" value={dynamicAddressFormat(arbiter.operatorBtcPubKey) || "-"} />
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        <div className='flex justify-between items-center mx-4 py-2'>
          <BoxTitle>Revenue</BoxTitle>
          <EnsureWalletNetwork continuesTo="Edit" evmConnectedNeeded supportedNetworkNeeded>
            <Button onClick={() => setEditRevenueIsOpen(true)}><DollarSignIcon />Edit</Button>
          </EnsureWalletNetwork>
        </div>
        <InfoRow title="EVM Address" value={dynamicAddressFormat(arbiter.revenueEvmAddress) || "-"} />
        <InfoRow title="BTC Address" value={dynamicAddressFormat(arbiter.revenueBtcAddress) || "-"} />
        <InfoRow title="BTC Public Key" value={dynamicAddressFormat(arbiter.revenueBtcPubKey) || "-"} />
      </div>

      <EditOperatorDialog arbiter={arbiter} isOpen={editOperatorIsOpen} onHandleClose={() => setEditOperatorIsOpen(false)} onContractUpdated={handleArbiterUpdated} />
      <EditSettingsDialog arbiter={arbiter} isOpen={editSettingsIsOpen} onHandleClose={() => setEditSettingsIsOpen(false)} onContractUpdated={handleArbiterUpdated} />
      <EditStakingDialog arbiter={arbiter} isOpen={editStakingIsOpen} onHandleClose={() => setEditStakingIsOpen(false)} onContractUpdated={handleArbiterUpdated} />
      <EditRevenueDialog arbiter={arbiter} isOpen={editRevenueIsOpen} onHandleClose={() => setEditRevenueIsOpen(false)} onContractUpdated={handleArbiterUpdated} />
    </div >
  )
}