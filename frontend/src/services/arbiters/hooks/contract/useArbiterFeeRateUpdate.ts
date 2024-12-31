import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbiterFeeRateUpdate = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  /**
   * @param feeRate Human readable, 1 for 1%
   */
  const updateFeeRate = useCallback(async (feeRate: number): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'setArbitratorFeeRate',
      // 1% must be encoded as 100
      args: [Math.round(feeRate * 100)]
    });

    console.log("Update fee rate result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { updateFeeRate, isPending, isSuccess, error };
};
