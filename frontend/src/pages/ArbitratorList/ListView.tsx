import { ArbitratorInfo } from "@/services/arbitrators/model/arbitrator-info";
import { FC } from "react";
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { SortConfig } from "./ArbitratorList";
import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAddress } from "@/utils/formatAddress";

export const ListView: FC<{
  arbitrators: ArbitratorInfo[];
  sortConfig: SortConfig;
  handleSort: (key: SortConfig['key']) => void;
}> = ({ arbitrators, sortConfig, handleSort }) => {
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
          <TableHead scope="col">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {arbitrators?.map((arbitrator) => (
          <TableRow key={arbitrator.address}>
            <TableCell className="whitespace-nowrap">
              <div className="font-mono text-sm">
                {formatAddress(arbitrator.address)}
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="text-sm">{Number(arbitrator.currentFeeRate) / 100}%</div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="text-sm">{Number(arbitrator.ethAmount)} {activeChain?.nativeCurrency.symbol}</div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${arbitrator.isPaused()
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
                }`}>
                {arbitrator.isPaused() ? 'Paused' : 'Active'}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
};