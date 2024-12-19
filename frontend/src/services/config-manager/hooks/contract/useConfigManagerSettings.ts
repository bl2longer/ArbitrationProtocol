import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback, useState } from 'react';
import { formatEther } from 'viem';
import { abi } from "../../../../../contracts/core/ConfigManager.sol/ConfigManager.json";

export type ConfigManagerSettings = {
  minStake: bigint; // readable number of native coins
  maxStake: bigint; // readable number of native coins
  minStakeLockedTime: bigint;
  minTransactionDuration: bigint;
  maxTransactionDuration: bigint;
  transactionMinFeeRate: bigint;
  arbitrationTimeout: bigint;
  arbitrationFrozenPeriod: bigint;
  systemFeeRate: bigint;
  systemCompensationFeeRate: bigint;
  systemFeeCollector: bigint;
}

export const useConfigManagerSettings = () => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract, isPending, isSuccess } = useContractCall();
  const [configManagerSettings, setConfigManagerSettings] = useState<ConfigManagerSettings>(undefined);

  const fetchAllSettings = useCallback(async (): Promise<ConfigManagerSettings> => {
    // native coin fees to pay to register a dapp.
    const contractSettings: [bigint[], bigint[]] = await readContract({
      contractAddress: activeChain?.contracts.configManager,
      abi,
      functionName: 'getAllConfigs',
      args: []
    });

    if (contractSettings === undefined) {
      setConfigManagerSettings(undefined);
      return undefined;
    }

    const csValues = contractSettings[1];
    const settings: ConfigManagerSettings = {
      minStake: BigInt(formatEther(csValues[0])),
      maxStake: BigInt(formatEther(csValues[1])),
      minStakeLockedTime: csValues[2],
      minTransactionDuration: csValues[3],
      maxTransactionDuration: csValues[4],
      transactionMinFeeRate: csValues[5],
      arbitrationTimeout: csValues[6],
      arbitrationFrozenPeriod: csValues[7],
      systemFeeRate: csValues[8],
      systemCompensationFeeRate: csValues[9],
      systemFeeCollector: csValues[10]
    };

    console.log("Got config manager settings:", settings);

    setConfigManagerSettings(settings);

    return settings;
  }, [activeChain, readContract]);

  return { fetchAllSettings, configManagerSettings, isPending, isSuccess };
};
