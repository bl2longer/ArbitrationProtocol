import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbiterRevenueUpdate = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  const updateRevenueInfo = useCallback(async (evmAddress: string, btcAddress: string, btcPubKey: string): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'setRevenueAddresses',
      args: [
        evmAddress,
        `0x${btcPubKey}`,
        btcAddress
      ]
    });

    console.log("Update revenue result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { updateRevenueInfo, isPending, isSuccess, error };
};
