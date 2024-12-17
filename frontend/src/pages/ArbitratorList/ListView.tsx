import { ArbitratorInfo } from "@/services/arbitrators/model/arbitrator-info";
import { FC } from "react";
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { SortConfig } from "./ArbitratorList";

export const ListView: FC<{
  arbitrators: ArbitratorInfo[];
  sortConfig: SortConfig;
  handleSort: (key: SortConfig['key']) => void;
}> = ({ arbitrators, sortConfig, handleSort }) => {

  const getSortIcon = (key: typeof sortConfig.key) => {
    if (sortConfig.key !== key) return <ChevronUpDownIcon className="w-4 h-4" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUpIcon className="w-4 h-4" />
      : <ChevronDownIcon className="w-4 h-4" />;
  };

  return <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('address')}>
            <div className="flex items-center space-x-1">
              <span>Address</span>
              {getSortIcon('address')}
            </div>
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" /* onClick={() => handleSort('feeRate')} */>
            <div className="flex items-center space-x-1">
              <span>Fee Rate</span>
              {/* {getSortIcon('feeRate')} */}
            </div>
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('stake')}>
            <div className="flex items-center space-x-1">
              <span>Stake</span>
              {getSortIcon('stake')}
            </div>
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {arbitrators.map((arbitrator) => (
          <tr key={arbitrator.address} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-mono text-sm">
                {arbitrator.address.slice(0, 6)}...{arbitrator.address.slice(-4)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {/* <div className="text-sm">{Number(arbitrator.info.feeRate) / 100}%</div> */}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm">{Number(arbitrator.ethAmount)} ETH</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${arbitrator.isPaused()
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
                }`}>
                {arbitrator.isPaused() ? 'Paused' : 'Active'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
};