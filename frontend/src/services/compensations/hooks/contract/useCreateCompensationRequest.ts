import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/CompensationManager.sol/CompensationManager.json";

export const useCreateCompensationRequest = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  const claimIllegalSignatureCompensation = useCallback(async (arbiter: string, btcTx: string, evidence: string): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.compensationManager,
      abi,
      functionName: 'claimIllegalSignatureCompensation',
      args: [arbiter, btcTx, evidence]
    });

    console.log("Claim illegal signature compensation result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  const claimTimeoutCompensation = useCallback(async (transactionId: string): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.compensationManager,
      abi,
      functionName: 'claimTimeoutCompensation',
      args: [transactionId]
    });

    console.log("Claim timeout compensation result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  const claimFailedArbitrationCompensation = useCallback(async (btcTx: string, evidence: string): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.compensationManager,
      abi,
      functionName: 'claimFailedArbitrationCompensation',
      args: [btcTx, evidence]
    });

    console.log("Claim failed arbitration compensation result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  const claimArbitratorFee = useCallback(async (transactionId: string): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.compensationManager,
      abi,
      functionName: 'claimArbitratorFee',
      args: [transactionId]
    });

    console.log("Claim failed arbitration compensation result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return {
    claimIllegalSignatureCompensation,
    claimTimeoutCompensation,
    claimFailedArbitrationCompensation,
    claimArbitratorFee,
    isPending, isSuccess, error
  };
};
