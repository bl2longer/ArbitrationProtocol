import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback, useEffect, useState } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";
import { ArbiterInfo } from '../../model/arbiter-info';

export const useArbiterConfigModifiable = (arbiter: ArbiterInfo) => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract } = useContractCall();
  const [isConfigModifiable, setIsConfigModifiable] = useState(false);

  const fetchArbiterConfigModifiable = useCallback(async (): Promise<boolean> => {
    const isActive: boolean = await readContract({
      contractAddress: activeChain.contracts.arbitratorManager,
      abi,
      functionName: 'isConfigModifiable',
      args: [arbiter.address]
    });

    return isActive;
  }, [activeChain, readContract, arbiter]);

  useEffect(() => {
    if (!arbiter)
      setIsConfigModifiable(undefined);
    else
      void fetchArbiterConfigModifiable().then(setIsConfigModifiable);
  }, [arbiter, fetchArbiterConfigModifiable]);

  return isConfigModifiable;
};
