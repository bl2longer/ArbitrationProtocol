import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { parseEther } from 'viem';
import { abi } from "../../../../../contracts/core/DAppRegistry.sol/DAppRegistry.json";

export const useArbitratorRegister = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  const register = useCallback(async (stakeAmount: bigint): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'stakeETH',
      args: [],
      value: parseEther(stakeAmount.toString())
    });

    console.log("Register arbitrator result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { register, isPending, isSuccess, error };
};
