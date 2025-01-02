import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

/**
 * Contract side 'isActive' ephemeral status.
 * @returns 
 */
export const useArbiterIsActive = () => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract } = useContractCall();

  const fetchArbiterIsActive = useCallback(async (arbiterAddress: string): Promise<boolean> => {
    const isActive: boolean = await readContract({
      contractAddress: activeChain.contracts.arbitratorManager,
      abi,
      functionName: 'isActiveArbitrator',
      args: [arbiterAddress]
    });

    return isActive;
  }, [activeChain, readContract]);

  return { fetchArbiterIsActive };
};
