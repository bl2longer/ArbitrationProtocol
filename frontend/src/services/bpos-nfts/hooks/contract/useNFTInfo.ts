import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { dtoToClass } from '@/services/class-transformer/class-transformer-utils';
import { useContractCall } from '@/services/evm/hooks/useContractCall';
import { useCallback } from 'react';
import { abi } from "../../../../../contracts/interfaces/IBNFTInfo.sol/IBNFTInfo.json";
import { BNFTVoteInfo } from '../../model/bnft-vote-info';

export const useNFTInfo = () => {
  const activeChain = useActiveEVMChainConfig();
  const { readContract, isSuccess } = useContractCall();

  const fetchNFTInfo = useCallback(async (tokenId: string): Promise<BNFTVoteInfo> => {
    const contractInfoResult = await readContract({
      contractAddress: activeChain?.contracts.nftInfo,
      abi,
      functionName: 'getNftInfo',
      args: [tokenId]
    });

    if (contractInfoResult === undefined)
      return undefined;

    const convertedNftInfo: BNFTVoteInfo = dtoToClass(contractInfoResult[1], BNFTVoteInfo);

    console.log("nft Info for token id", tokenId, ":", contractInfoResult, convertedNftInfo);

    return convertedNftInfo;
  }, [activeChain, readContract]);

  return { fetchNFTInfo };
};
