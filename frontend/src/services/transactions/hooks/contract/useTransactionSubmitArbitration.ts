import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/TransactionManager.sol/TransactionManager.json";

export const useTransactionSubmitArbitration = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  const submitArbitration = useCallback(async (txId: string, signature: string): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.transactionManager,
      abi,
      functionName: 'submitArbitration',
      args: [txId, signature]
    });

    console.log("StakeETH result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { submitArbitration, isPending, isSuccess, error };
};
