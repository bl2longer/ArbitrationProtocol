import { ArbitratorInfo } from "@/services/arbitrators/model/arbitrator-info";
import { useActiveChainNativeCoin } from "@/services/chains/hooks/useActiveChainNativeCoin";
import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { formatAddress } from "@/utils/formatAddress";
import { FC } from "react";

export const GridView: FC<{
  arbitrators: ArbitratorInfo[],
}> = ({ arbitrators }) => {
  const activeChain = useActiveEVMChainConfig();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {arbitrators.map((arbitrator) => (
        <div key={arbitrator.address} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">
              {arbitrator.address.slice(0, 6)}...{arbitrator.address.slice(-4)}
            </h3>
            <span className={`px-2 py-1 rounded text-sm ${arbitrator.isPaused()
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
              }`}>
              {arbitrator.isPaused() ? 'Paused' : 'Active'}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Operator</span>
              <span className="font-mono">{formatAddress(arbitrator.operatorEvmAddress)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fee Rate</span>
              <span>{Number(arbitrator.currentFeeRate) / 100}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Term Duration</span>
              <span>{Number(arbitrator.lastArbitrationTime) / 86400} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stake</span>
              <span>{Number(arbitrator.ethAmount)} {activeChain?.nativeCurrency.symbol}</span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-gray-600 mb-1">BTC Address</div>
              <div className="font-mono text-xs break-all">{formatAddress(arbitrator.operatorBtcAddress)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}