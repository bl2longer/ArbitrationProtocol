import { StatusLabel } from "@/components/base/StatusLabel";
import { ArbitratorInfo } from "@/services/arbitrators/model/arbitrator-info";
import { FC } from "react";

export const ArbitratorPreview: FC<{
  arbitrator: ArbitratorInfo;
}> = ({ arbitrator }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow divide-y">
      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">Address</div>
        <div className="font-mono">{arbitrator.address}</div>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">Operator</div>
        <div className="font-mono">{arbitrator.operatorEvmAddress}</div>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">BTC Public Key</div>
        <div className="font-mono break-all">{arbitrator.operatorBtcPubKey}</div>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">BTC Address</div>
        <div className="font-mono">{arbitrator.operatorBtcAddress}</div>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">Fee Rate</div>
        <div>{Number(arbitrator.currentFeeRate) / 100}%</div>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">Term Duration</div>
        <div>{Number(arbitrator.lastArbitrationTime) / 86400} days</div>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">Stake Amount</div>
        <div>{arbitrator.ethAmount.toString()} ETH</div>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm text-gray-500">Status</div>
        <div>
          <StatusLabel
            title={arbitrator.isPaused() ? 'Paused' : 'Active'}
            color={arbitrator.isPaused() ? 'red' : 'green'}
          />
        </div>
      </div>
    </div>
  </div>
);