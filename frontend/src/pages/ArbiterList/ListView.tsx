import { CopyField } from "@/components/base/CopyField";
import { StatusLabel } from "@/components/base/StatusLabel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { arbiterStatusLabelColor } from "@/services/arbiters/arbiters.service";
import { ArbiterInfo } from "@/services/arbiters/model/arbiter-info";
import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { formatAddress } from "@/utils/formatAddress";
import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { ChevronsUpDown } from "lucide-react";
import { FC } from "react";
import { SortConfig } from "./ArbiterList";

export const ListView: FC<{
  arbiters: ArbiterInfo[];
  sortConfig: SortConfig;
  handleSort: (key: SortConfig['key']) => void;
}> = ({ arbiters, sortConfig, handleSort }) => {
  const activeChain = useActiveEVMChainConfig();

  const getSortIcon = (key: typeof sortConfig.key) => {
    if (sortConfig.key !== key) return <ChevronUpDownIcon className="w-4 h-4" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUpIcon className="w-4 h-4" />
      : <ChevronDownIcon className="w-4 h-4" />;
  };

  return <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="cursor-pointer" onClick={() => handleSort('address')}>
            <div className="flex items-center space-x-1">
              <span>Address</span>
              {getSortIcon('address')}
            </div>
          </TableHead>
          <TableHead scope="col">Operator</TableHead>
          <TableHead scope="col" className="cursor-pointer" onClick={() => handleSort('currentFeeRate')}>
            <div className="flex items-center space-x-1">
              <span>Fee Rate</span>
              {getSortIcon('currentFeeRate')}
            </div>
          </TableHead>
          <TableHead scope="col" className="cursor-pointer" onClick={() => handleSort('stake')}>
            <div className="flex items-center space-x-1">
              <span>Stake</span>
              {getSortIcon('stake')}
            </div>
          </TableHead>
          <TableHead scope="col">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {arbiters?.map(arbiter => (
          <TableRow key={arbiter.address}>
            <TableCell className="whitespace-nowrap font-mono text-sm">
              {formatAddress(arbiter.address)}
              <CopyField value={arbiter.address} />
            </TableCell>
            <TableCell><OperatorInfo arbiter={arbiter} /></TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="text-sm">{Number(arbiter.currentFeeRate) / 100}%</div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="text-sm">{Number(arbiter.getTotalValue())} {activeChain?.nativeCurrency.symbol}</div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <StatusLabel
                title={arbiter.status}
                color={arbiterStatusLabelColor(arbiter)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
};

const OperatorInfo: FC<{ arbiter: ArbiterInfo }> = ({ arbiter }) => {
  return (
    <Collapsible className="w-full">
      <CollapsibleTrigger className="w-72 mb-1">
        <div className="flex justify-between items-center w-full">
          <span className="text-gray-600">EVM Address</span>
          <div className="flex items-center">
            <span className="font-mono">{formatAddress(arbiter.operatorEvmAddress)}</span>
            <ChevronsUpDown className="h-3 w-3" />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pr-3 w-72">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">BTC Address</span>
          <span className="font-mono">{formatAddress(arbiter.operatorBtcAddress)}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-gray-600">BTC Pub Key</span>
          <span className="font-mono">{formatAddress(arbiter.operatorBtcPubKey)}</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}