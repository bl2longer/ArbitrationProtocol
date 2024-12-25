import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbiterOperatorUpdate = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  const updateOperatorInfo = useCallback(async (evmAddress: string, btcAddress: string, btcPubKey: string): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'setOperator',
      args: [
        evmAddress,
        `0x${btcPubKey}`,
        btcAddress
      ]
    });

    console.log("Update operator result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { updateOperatorInfo, isPending, isSuccess, error };
};
