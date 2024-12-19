import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { parseEther } from 'viem';
import { abi } from "../../../../contracts/core/DAppRegistry.sol/DAppRegistry.json";

export const useDappRegistryContract = (dappAddress: string, registrationFee: string) => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  const register = useCallback(async () => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.dappRegistry,
      abi,
      functionName: 'registerDApp',
      args: [dappAddress],
      value: parseEther(registrationFee)
    });
    console.log("DAPP RES", hash, receipt)
  }, [activeChain, dappAddress, registrationFee, writeContract]);

  return { register, isPending, isSuccess, error };
};
