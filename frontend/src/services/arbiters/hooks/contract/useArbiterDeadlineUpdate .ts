import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbiterDeadlineUpdate = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  /**
   * @param deadline Unix timestamp (secs)
   */
  const updateDeadline = useCallback(async (deadline: bigint): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'setArbitratorDeadline',
      args: [deadline]
    });

    console.log("Update deadline result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { updateDeadline, isPending, isSuccess, error };
};
