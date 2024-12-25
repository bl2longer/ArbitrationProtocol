import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { parseEther } from 'viem';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbiterStake = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  /**
   * Stakes native coin
   * @param stakeAmount human readable amount of native coins
   */
  const stakeETH = useCallback(async (stakeAmount: bigint): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'stakeETH',
      args: [],
      value: parseEther(stakeAmount.toString())
    });

    console.log("StakeETH result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { stakeETH, isPending, isSuccess, error };
};
