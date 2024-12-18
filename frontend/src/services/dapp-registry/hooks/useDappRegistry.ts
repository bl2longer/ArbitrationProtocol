import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useCallback } from 'react';
import { Address, parseEther } from 'viem';
import { useWriteContract } from 'wagmi';
import { abi as DAppRegistryABI } from "../../../../contracts/core/DAppRegistry.sol/DAppRegistry.json";

export const useDappRegistration = (dappAddress: string, registrationFee: string) => {
  const activeChain = useActiveEVMChainConfig();
  const contractAddress = activeChain?.contracts.dappRegistry;
  const { writeContract, error, data: hash, isPending, isSuccess } = useWriteContract();

  console.log("hash", hash)

  const register = useCallback(() => {
    console.log("REGISTERING");
    writeContract({
      address: contractAddress as Address,
      abi: DAppRegistryABI,
      functionName: 'registerDApp',
      args: [dappAddress],
      value: parseEther(registrationFee),
      chain: null, // TODO
      account: null // TODO
      //enabled: Boolean(contractAddress && dappAddress)
    });
  }, [contractAddress, dappAddress, registrationFee, writeContract]);

  return {
    register,
    hash,
    isPending,
    isSuccess,
    error
  };
};
