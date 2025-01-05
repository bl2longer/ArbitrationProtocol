import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/interfaces/IZkService.sol/IZkService.json";
import { ZKVerification } from '../../dto/zk-verification';

export const useZKPVerificationStatus = () => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract } = useContractCall();

  /**
   * @param requestId ID of a request previously created by zkpService.submitArbitration().
   */
  const fetchZKPVerificationStatus = useCallback(async (requestId: string): Promise<ZKVerification> => {
    if (!requestId)
      return undefined;

    const zkVerification: ZKVerification = await readContract({
      contractAddress: activeChain.contracts.zkpService,
      abi,
      functionName: 'getZkVerification',
      args: [requestId]
    });

    return zkVerification;
  }, [activeChain, readContract]);

  return { fetchZKPVerificationStatus };
};
