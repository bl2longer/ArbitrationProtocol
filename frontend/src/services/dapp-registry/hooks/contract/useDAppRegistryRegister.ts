import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { parseEther } from 'viem';
import { abi } from "../../../../../contracts/core/DAppRegistry.sol/DAppRegistry.json";

export const useDappRegistryRegister = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  const register = useCallback(async (dappAddress: string, registrationFee: bigint): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.dappRegistry,
      abi,
      functionName: 'registerDApp',
      args: [dappAddress],
      value: parseEther(registrationFee.toString())
    });

    console.log("Register dapp result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { register, isPending, isSuccess, error };
};
