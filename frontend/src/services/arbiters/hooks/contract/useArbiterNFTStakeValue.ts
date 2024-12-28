import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { tokenToReadableValue } from '@/services/tokens/tokens';
import BigNumber from 'bignumber.js';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

/**
 * Value in native coins of NFTs staked for this arbiter.
 * Human readable amount.
 */
export const useArbiterNFTStakeValue = () => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract } = useContractCall();

  const fetchArbiterNFTStakeValue = useCallback(async (arbiterAddress: string): Promise<BigNumber> => {
    const nftValue: bigint = await readContract({
      contractAddress: activeChain.contracts.arbitratorManager,
      abi,
      functionName: 'getTotalNFTStakeValue',
      args: [arbiterAddress]
    });

    return nftValue && tokenToReadableValue(nftValue, 18);
  }, [activeChain, readContract]);

  return { fetchArbiterNFTStakeValue };
};
