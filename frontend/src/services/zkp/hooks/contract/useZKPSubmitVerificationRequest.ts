import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/interfaces/IZkService.sol/IZkService.json";

export const useZKPSubmitVerificationRequest = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  /**
   * Submits a verification request to the ZKP service. The returned value is to be used
   * both as id for zkpservice.getZkVerification(), and it's also the "evidence" needed by
   * requests to the compensationManager. Nevertheless, eventhough the evidence is returned right
   * away after calling this method, compensation request must be sutmitted only after making
   * sure the verification process ha s completed, otherwise it will fail.
   */
  const submitVerificationRequest = useCallback(async (pubKey: string, rawData: string, utxos: string[], inputIndex: number, signatureIndex: number): Promise<string> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.zkpService,
      abi,
      functionName: 'submitArbitration',
      args: [
        `0x${pubKey}`,
        `0x${rawData}`,
        utxos.map(u => `0x${u}`),
        inputIndex,
        signatureIndex
      ],
    });

    if (!hash)
      return null;

    console.log("Submit verification request result:", hash, receipt);

    return "TODO RETURNED ID FROM CONTRACT";
  }, [activeChain, writeContract]);

  return { submitVerificationRequest, isPending, isSuccess, error };
};
