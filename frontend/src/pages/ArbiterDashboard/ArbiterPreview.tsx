import { StatusLabel } from "@/components/base/StatusLabel";
import { ArbiterInfo } from "@/services/arbiters/model/arbiter-info";
import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { formatDateWithoutYear } from "@/utils/dates";
import { FC, ReactNode } from "react";

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow divide-y">
        <InfoRow title="Address" value={arbiter.address} />
        <InfoRow title="Status" value={<StatusLabel
          title={arbiter.isPaused() ? 'Paused' : 'Active'}
          color={arbiter.isPaused() ? 'red' : 'green'}
        />} />
        <InfoRow title="Fee Rate" value={`${Number(arbiter.currentFeeRate) / 100}%`} />
        <InfoRow title="Term End" value={termEnd ? formatDateWithoutYear(termEnd) : "Not set"} />
        <InfoRow title="Operator EVM Address" value={arbiter.operatorEvmAddress || "Not set"} />
        <InfoRow title="Operator BTC Address" value={arbiter.operatorBtcAddress || "Not set"} />
        <InfoRow title="Operator BTC Public Key" value={arbiter.operatorBtcPubKey || "Not set"} />
        <InfoRow title="Stake Amount" value={`${arbiter.ethAmount.toString()} ${activeChain?.nativeCurrency.symbol}`} />
        <InfoRow title="Revenue EVM Address" value={arbiter.revenueEvmAddress || "Not set"} />
        <InfoRow title="Revenue BTC Address" value={arbiter.revenueBtcAddress || "Not set"} />
        <InfoRow title="Revenue BTC Public Key" value={arbiter.revenueBtcPubKey || "Not set"} />
      </div>
    </div >
  )
}