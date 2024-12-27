import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import BigNumber from 'bignumber.js';
import { useCallback } from 'react';
import { parseEther } from 'viem';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbiterStake = () => {
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  /**
   * Stakes native coin
   * @param stakeAmount human readable amount of native coins
   */
  const stakeETH = useCallback(async (stakeAmount: BigNumber): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'stakeETH',
      args: [],
      value: parseEther(stakeAmount.toString())
    });

    console.log("StakeETH result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  /**
   * Stakes NFTs
   */
  const stakeNFT = useCallback(async (tokenIds: string[]): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'stakeNFT',
      args: [tokenIds]
    });

    console.log("StakeNFT result:", hash, receipt)
    return !!receipt;
  }, [activeChain, writeContract]);

  return { stakeETH, stakeNFT, isPending, isSuccess, error };
};
