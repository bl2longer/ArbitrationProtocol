import { StatusLabel } from "@/components/base/StatusLabel";
import { ArbitratorInfo } from "@/services/arbitrators/model/arbitrator-info";
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

export const ArbitratorPreview: FC<{
  arbitrator: ArbitratorInfo;
}> = ({ arbitrator }) => {
  const termEnd = arbitrator.getTermEndDate();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow divide-y">
        <InfoRow title="Address" value={arbitrator.address} />
        <InfoRow title="Operator" value={arbitrator.operatorEvmAddress || "Not set"} />
        <InfoRow title="BTC Address" value={arbitrator.operatorBtcAddress || "Not set"} />
        <InfoRow title="BTC Public Key" value={arbitrator.operatorBtcPubKey || "Not set"} />
        <InfoRow title="Stake Amount" value={arbitrator.ethAmount.toString()} />
        <InfoRow title="Revenue Address" value={arbitrator.revenueEvmAddress || "Not set"} />
        <InfoRow title="Revenue BTC Address" value={arbitrator.revenueBtcAddress || "Not set"} />
        <InfoRow title="Revenue BTC Public Key" value={arbitrator.revenueBtcPubKey || "Not set"} />
        <InfoRow title="Fee Rate" value={`${Number(arbitrator.currentFeeRate) / 100}%`} />
        <InfoRow title="Term End" value={termEnd ? formatDateWithoutYear(termEnd) : "Not set"} />
        <InfoRow title="Status" value={<StatusLabel
          title={arbitrator.isPaused() ? 'Paused' : 'Active'}
          color={arbitrator.isPaused() ? 'red' : 'green'}
        />} />
      </div>
    </div >
  )
}