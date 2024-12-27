import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";
import { ContractArbiterInfo } from '../../dto/contract-arbiter-info';
import { ArbiterInfo } from '../../model/arbiter-info';

/**
 * Retrieves an arbiter from the contract instead of subgraph.
 * Used when we need latest information such as when editing an owned arbiter, as subgraph
 * sometimes has stale information.
 */
export const useArbiterInfo = (arbiterAddress: string) => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract } = useContractCall();

  const fetchArbiterInfo = useCallback(async (): Promise<ArbiterInfo> => {
    console.log("fetchArbiterInfo real")
    // native coin fees to pay to register a dapp.
    const contractArbiterInfo: ContractArbiterInfo = await readContract({
      contractAddress: activeChain.contracts.arbitratorManager,
      abi,
      functionName: 'getArbitratorInfo',
      args: [arbiterAddress]
    });

    if (contractArbiterInfo === undefined)
      return undefined;

    console.log("Got contractArbiterInfo:", contractArbiterInfo);

    const arbiter = ArbiterInfo.fromContractArbiterInfo(contractArbiterInfo);

    console.log("Got arbiter info:", arbiter);

    return arbiter;
  }, [activeChain, readContract, arbiterAddress]);

  return { fetchArbiterInfo };
};
