import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { parseEther } from 'viem';
import { abi } from "../../../../../contracts/core/ArbitratorManager.sol/ArbitratorManager.json";

export const useArbitratorRegister = () => {
  const { evmAccount } = useWalletContext();
  const activeChain = useActiveEVMChainConfig();
  const { writeContract, isPending, isSuccess, error } = useContractCall();

  /**
   * Registers by staking native coin
   * @param stakeAmount human readable amount of native coins
   */
  const registerArbitratorByStakeETH = useCallback(async (
    stakeAmount: bigint,
    revenueAddress: string,
    btcAddress: string,
    btcPubKey: string,
    feeRate: bigint,
    deadline: bigint
  ): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'registerArbitratorByStakeETH',
      args: [
        evmAccount, // Default operator is the connected wallet
        revenueAddress,
        btcAddress,
        `0x${btcPubKey}`,
        feeRate * 100n, // 1% must be encoded as 100
        deadline
      ],
      value: parseEther(stakeAmount.toString())
    });

    console.log("Register arbitrator by staking ETH result:", hash, receipt)
    return !!receipt;
  }, [activeChain, evmAccount, writeContract]);

  /**
   * Registers by staking BPos NFTs
   */
  const registerArbitratorByStakeNFT = useCallback(async (
    tokenIds: string[],
    revenueAddress: string,
    btcAddress: string,
    btcPubKey: string,
    feeRate: bigint,
    deadline: bigint
  ): Promise<boolean> => {
    const { hash, receipt } = await writeContract({
      contractAddress: activeChain?.contracts.arbitratorManager,
      abi,
      functionName: 'registerArbitratorByStakeNFT',
      args: [
        tokenIds,
        evmAccount, // Default operator is the connected wallet
        revenueAddress,
        btcAddress,
        `0x${btcPubKey}`,
        feeRate * 100n, // 1% must be encoded as 100
        deadline
      ]
    });

    console.log("Register arbitrator by staking NFT result:", hash, receipt)
    return !!receipt;
  }, [activeChain, evmAccount, writeContract]);

  return {
    registerArbitratorByStakeETH,
    registerArbitratorByStakeNFT,
    isPending,
    isSuccess,
    error
  };
};
