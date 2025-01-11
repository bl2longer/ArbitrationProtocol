import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/CompensationManager.sol/CompensationManager.json";

export const useWithdrawCompensation = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  const withdrawCompensation = useCallback(async (compensationId: string): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.compensationManager,
      abi,
      functionName: 'withdrawCompensation',
      args: [compensationId]
    });

    console.log("Withdraw compensation result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return {
    withdrawCompensation,
    isPending, isSuccess, error
  };
};
