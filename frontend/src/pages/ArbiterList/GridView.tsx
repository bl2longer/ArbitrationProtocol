import { StatusLabel } from "@/components/base/StatusLabel";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArbiterInfo } from "@/services/arbiters/model/arbiter-info";
import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { formatDateWithoutYear } from "@/utils/dates";
import { formatAddress } from "@/utils/formatAddress";
import { ChevronsUpDown } from "lucide-react";
import { FC } from "react";

export const GridView: FC<{
  arbiters: ArbiterInfo[],
}> = ({ arbiters }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {arbiters.map(arbiter => <ArbiterGridItem key={arbiter.address} arbiter={arbiter} />)}
    </div>
  )
}

const ArbiterGridItem: FC<{ arbiter: ArbiterInfo }> = ({ arbiter }) => {
  const activeChain = useActiveEVMChainConfig();
  const termEnd = arbiter.getTermEndDate();

  return <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-semibold">
        {arbiter.address.slice(0, 6)}...{arbiter.address.slice(-4)}
      </h3>
      <StatusLabel
        title={arbiter.isPaused() ? 'Paused' : 'Active'}
        color={arbiter.isPaused() ? 'red' : 'green'}
      />
    </div>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Fee Rate</span>
        <span>{Number(arbiter.currentFeeRate) / 100}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Term end</span>
        <span>{termEnd ? formatDateWithoutYear(termEnd) : '-'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Stake</span>
        <span>{Number(arbiter.ethAmount)} {activeChain?.nativeCurrency.symbol}</span>
      </div>
      <div className="mt-4 pt-4 border-t">
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <div className="flex justify-between items-center w-full">
              <span className="text-gray-600">Operator EVM Address</span>
              <div className="flex items-center">
                <span className="font-mono">{formatAddress(arbiter.operatorEvmAddress)}</span>
                <Button variant="ghost" className="-mr-6" size="sm"><ChevronsUpDown className="h-3 w-3" /></Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pr-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Operator BTC Address</span>
              <span className="font-mono">{formatAddress(arbiter.operatorBtcAddress)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-600">Operator BTC Pub Key</span>
              <span className="font-mono">{formatAddress(arbiter.operatorBtcPubKey)}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  </div>
}