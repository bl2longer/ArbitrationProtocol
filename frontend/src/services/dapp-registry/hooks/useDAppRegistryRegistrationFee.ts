import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback, useState } from 'react';
import { formatEther } from 'viem';
import { abi } from "../../../../contracts/core/DAppRegistry.sol/DAppRegistry.json";

export const useDAppRegistryRegistrationFee = () => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract, isPending, isSuccess } = useContractCall();
  const [registrationFee, setRegistrationFee] = useState<bigint>(undefined);

  const fetchRegistrationFee = useCallback(async (): Promise<bigint> => {
    // native coin fees to pay to register a dapp.
    const contractFee: bigint = await readContract({
      contractAddress: activeChain?.contracts.dappRegistry,
      abi,
      functionName: 'REGISTRATION_FEE',
      args: []
    });

    if (contractFee === undefined) {
      setRegistrationFee(undefined);
      return undefined;
    }

    const readableFee = BigInt(formatEther(contractFee));
    setRegistrationFee(readableFee);
    return readableFee;
  }, [activeChain, readContract]);

  return { fetchRegistrationFee, registrationFee, isPending, isSuccess };
};
