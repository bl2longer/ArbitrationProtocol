import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbiterParamsUpdate = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  /**
   * @param feeRate Human readable, 1 for 1%
   */
  const updateParams = useCallback(async (feeRate: number, deadline: bigint): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'setArbitratorParams',
      args: [
        Math.round(feeRate * 100), // 1% must be encoded as 100
        deadline
      ]
    });

    console.log("Update operator result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { updateParams, isPending, isSuccess, error };
};
