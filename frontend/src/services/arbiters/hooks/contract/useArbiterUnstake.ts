import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbiterUnstake = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  /**
   * Unstake everything from the arbiter.
   */
  const unstake = useCallback(async (): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'unstake',
      args: [],
    });

    console.log("Unstake arbiter result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { unstake, isPending, isSuccess, error };
};
