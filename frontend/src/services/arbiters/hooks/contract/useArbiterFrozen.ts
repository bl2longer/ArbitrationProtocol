import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbiterFrozen = () => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract } = useContractCall();

  const fetchArbiterFrozen = useCallback(async (arbiterAddress: string): Promise<boolean> => {
    if (!arbiterAddress)
      return false;

    const isFrozen: boolean = await readContract({
      contractAddress: activeChain.contracts.arbitratorManager,
      abi,
      functionName: 'isFrozenStatus',
      args: [arbiterAddress]
    });

    return isFrozen;
  }, [activeChain, readContract]);

  return { fetchArbiterFrozen };
};
